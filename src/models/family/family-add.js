'use strict';

const _ = require('lodash');

const AbstractModelAdd = require('../abstract/abstract-model-add');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsKnex = require('../../utils/utils-knex');


class FamilyAdd extends AbstractModelAdd {
  async add(options) {
    let self = {insertRow: {}};
    let context = {options, creatingClassName: this.name, addedAt: Utils.getDatetimeUTC()};

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
    let options = context.options;

    // Some additional validations if we got called from a child class
    /*if(context.creatingClassName !== this.name) {
      if(_.has(options, CONSTANTS.ATTR_ID_FAMILY)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_FAMILY);
        return true;
    }

      if(!options[CONSTANTS.ATTR_NAME_FAMILY]) {
        throw new Error(`options.familyId is not set. Missing familyId or attributes to create a new family.`);
      }
    }*/

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_FAMILY);
    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_FAMILY);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_FAMILY);
  }

  init(self, context) {
    self.insertRow = {};
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
    self.insertId = rows[0]; 
  }

  buildReturnObject(self, context) {
    return {
      [this.constructor.PLURAL]: {
        [self.insertId]: {
          [this.constructor.ATTR_ID]: self.insertId,
          ...self.insertRow
        }
      }
    }
  }
}

FamilyAdd.TABLE = CONSTANTS.TABLE_FAMILY;

FamilyAdd.ATTR_ID = CONSTANTS.ATTR_ID_FAMILY;

FamilyAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_FAMILY;

FamilyAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_FAMILY;

FamilyAdd.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_GENERATIONS_FAMILY;

FamilyAdd.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_GENERATION;

FamilyAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_FAMILY;

FamilyAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_FAMILY]: '',
  [CONSTANTS.ATTR_GENERATIONS_FAMILY]: []
};

FamilyAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_GENERATIONS_FAMILY
];

FamilyAdd.PLURAL = CONSTANTS.PLURAL_FAMILY;

module.exports = FamilyAdd;
