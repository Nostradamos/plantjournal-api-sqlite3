'use strict';

const _ = require('lodash');

const Utils = require('../../utils/utils');
const UtilsKnex = require('../../utils/utils-knex');

class AbstractModelAdd {
  constructor(model) {
    this.model = model;
    this.knex = this.model.plantJournal.knex;
    this.logger = this.model.plantJournal.logger;
  }

  async add(options) {
    this.logger.debug(`${this.name} #create() options:`, JSON.stringify(options));
    Utils.hasToBeAssocArray(options);
    
    let self = {insertRow: {}};
    let context = {
      options,
      creatingClassName: this.name,
      addedAt: Utils.getDatetimeUTC(),
      insertIds: {}
    };

    this.validate(self, context);
    this.setFields(self, context);
    this.setAddedAtAndModifiedAtFields(self, context);
    this.logger.info(self, context);

    let transaction = await UtilsKnex.newTransaction(this.knex);
    try {
      await this.insert(self, context, transaction);
    } catch(err) {
      this.logger.error(err);
      this.logger.debug('Rolling back...');
      await transaction.rollback();
    }
    await transaction.commit();

    return this.buildReturnObject(self, context);
  }

  /**
   * We need to validate the options.familyName property and throw
   * Error if we don't accept the input.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   * @return {Boolean}
   *         Return true if we don't need to insert this record and this class
   *         reference and it's parents should get deleted from the callStack.
   */
  validate(self, context) {
    return false;
  }

  setFields(self, context) {
    for(let attr of this.constructor.ATTRIBUTES) {
      if (_.indexOf(this.constructor.SKIP_ATTRIBUTES, attr) !== -1) {
        continue;
      }
      let value;
      if (!_.isUndefined(context[attr])) {
        value = context[attr];
      } else if (!_.isUndefined(context.options[attr])) {
        value = context.options[attr];
      } else if (!_.isUndefined(this.constructor.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        value = this.constructor.DEFAULT_VALUES_ATTRIBUTES[attr];
      } else {
        value = null;
      }
      self.insertRow[attr] = value;
    }
  }

  setAddedAtAndModifiedAtFields(self, context) {
    self.insertRow[this.constructor.ATTR_ADDED_AT] = context.addedAt;
    self.insertRow[this.constructor.ATTR_MODIFIED_AT] = context.addedAt;
  }

  async insert(self, context, transaction) {
    let rows = await transaction.insert(self.insertRow).into(this.constructor.TABLE);
    context.insertIds[this.constructor.ATTR_ID] = rows[0]; 
  }

  buildReturnObject(self, context) {
    let skippedAttributes = {};
    for(let attr of this.constructor.SKIP_ATTRIBUTES) {
      let value;
      if (!_.isUndefined(context[attr])) {
        value = context[attr];
      } else if (attr === this.constructor.ATTR_FILL_CHILD_IDS) {
        value = this.constructor.ATTR_CHILD_ID in context.insertIds ?
          [context.insertIds[this.constructor.ATTR_CHILD_ID]] :
          [];
      } else if (!_.isUndefined(context.insertIds[attr])){
        value = context.insertIds[attr];
      } else if (!_.isUndefined(context.options[attr])) {
        value = context.options[attr];
      } else if (!_.isUndefined(this.constructor.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        value = this.constructor.DEFAULT_VALUES_ATTRIBUTES[attr];
      } else {
        value = null;
      }
      skippedAttributes[attr] = value;
    }
    return {
      [this.constructor.PLURAL]: {
        [context.insertIds[this.constructor.ATTR_ID]]: {
          [this.constructor.ATTR_ID]: context.insertIds[this.constructor.ATTR_ID],
          ...self.insertRow,
          ...skippedAttributes
        }
      }
    }
  }
}

AbstractModelAdd.PARENT = false;

// set this field for the default table name used in #initQuery()
AbstractModelAdd.TABLE = null;

AbstractModelAdd.ATTR_ID;

AbstractModelAdd.ATTR_ADDED_AT;

AbstractModelAdd.ATTR_MODIFIED_AT;

AbstractModelAdd.ATTR_FILL_CHILD_IDS;

AbstractModelAdd.ATTR_CHILD_ID;

AbstractModelAdd.ATTRIBUTES = [];

AbstractModelAdd.SKIP_ATTRIBUTES = [];

AbstractModelAdd.DEFAULT_VALUES_ATTRIBUTES = [];

AbstractModelAdd.PLURAL;

module.exports = AbstractModelAdd;
