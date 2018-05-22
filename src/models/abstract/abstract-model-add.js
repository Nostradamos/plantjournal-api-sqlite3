'use strict';

const _ = require('lodash');

const Utils = require('../../utils/utils');
const UtilsKnex = require('../../utils/utils-knex');


class InSeriesCaller {
  constructor(methodHolderObjects, context, selfGenerator, logger) {
    this.logger = logger;
    this.methodHolderObjects = methodHolderObjects;
    this.selfs = methodHolderObjects.map(selfGenerator);
    this.context = context;
    this.logger.debug(`${this.constructor.name} selfs:`, JSON.stringify(this.selfs));
  }

  async _call(shouldAwait, reverse, functionName, ...args) {
    if(reverse) {
      for(let i=this.methodHolderObjects.length-1;i>=0;i--) {
        let methodHolder = this.methodHolderObjects[i];
        await this._callMethodHolder(shouldAwait, methodHolder, i, functionName, ...args);
      }
    } else {
      for(let i=0;i<this.methodHolderObjects.length;i++) {
        let methodHolder = this.methodHolderObjects[i];
        await this._callMethodHolder(shouldAwait, methodHolder, i, functionName, ...args);
      }
    }
  }

  async _callMethodHolder(shouldAwait, methodHolder, i, functionName, ...args) {
    let fullArgs = [this.selfs[i], this.context, ...args];
    let method = methodHolder[functionName].bind(methodHolder);
    this.logger.debug(`${this.constructor.name} calling ${methodHolder.constructor.name}.${functionName}(...)`);
    shouldAwait ? await method(...fullArgs) : method(...fullArgs);
  }

  async call(functionName, ...args) {
    console.log('a', functionName);
    await this._call(false, false, functionName, ...args);
    console.log('b', functionName);
  }

  async asyncCall(functionName, ...args) {
    await this._call(true, false, functionName, ...args);
  }

  async asyncCallReverse(functionName, ...args) {
    await this._call(true, true, functionName, ...args);
  }
}

class AbstractModelAdd {
  constructor(model) {
    this.model = model;
    this.knex = this.model.plantJournal.knex;
    this.plantJournal = this.model.plantJournal;
    this.logger = this.model.plantJournal.logger;
    this._resolveParentClasses();
  }

  _resolveParentClasses() {
    this.RELATED_INSTANCES = [this];
    let parent = this.constructor.PARENT;
    let plantJournal = this.model.plantJournal;
    if(parent) {
      this.RELATED_INSTANCES = [this, ...plantJournal[parent].INSTANCE_ADD.RELATED_INSTANCES];
    }
    this.logger.debug(`${this.constructor.name} RELATED_INSTANCES: ${this.RELATED_INSTANCES.map((instance) => instance.constructor.name)}`);
  }

  async add(options) {
    this.logger.debug(`${this.constructor.name} #create() options:`, JSON.stringify(options));
    Utils.hasToBeAssocArray(options);
    
    let context = {
      options,
      creatingClassName: this.constructor.name,
      addedAt: Utils.getDatetimeUTC(),
      insertIds: {}
    };

    let instancesToCall = [];
    for(let instance of this.RELATED_INSTANCES) {
      this.logger.debug(`${this.constructor.name} Calling ${instance.constructor.name}.validate(...)`);
      if(instance.validate(context, instance === this) === false) {
        this.logger.debug(`${this.constructor.name} skipping ${instance.constructor.name} and parents`);
        break;
      }
      instancesToCall.push(instance);
    }

    this.logger.debug(`${this.constructor.name} instancesToCall: ${instancesToCall.map((ins => ins.constructor.name))}`);
    let inSeriesCaller = new InSeriesCaller(instancesToCall, context, () => {return {insertRow: {}}}, this.logger); 

    await inSeriesCaller.call('setFields');
    await inSeriesCaller.call('setAddedAtAndModifiedAtFields');

    let transaction = await UtilsKnex.newTransaction(this.knex);
    try {
      await inSeriesCaller.asyncCallReverse('insert', transaction);
    } catch(err) {
      this.logger.error(`${this.constructor.name} Error during insert:`, err);
      this.logger.debug('Rolling back...');
      await transaction.rollback();
      throw err;
    }
    await transaction.commit();
    
    let returnObject = {};
    await inSeriesCaller.call('buildReturnObject', returnObject);
    this.logger.debug(`${this.constructor.name} returnObject: ${JSON.stringify(returnObject)}`);
    return returnObject;
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
  validate(context) {
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
    if(this.constructor.PARENT) {
      let parentAttrId = this.plantJournal[this.constructor.PARENT].INSTANCE_ADD.constructor.ATTR_ID;
      let parentId = null;
      if(context.insertIds[parentAttrId]) {
        parentId = context.insertIds[parentAttrId];
      } else if(context.options[parentAttrId]) {
        parentId = context.options[parentAttrId];
      }
      self.insertRow[parentAttrId] = parentId;
    }
    this.logger.debug(`${this.constructor.name} insertRow:`, self.insertRow);
    let rows = await transaction.insert(self.insertRow).into(this.constructor.TABLE);
    context.insertIds[this.constructor.ATTR_ID] = rows[0];
  }

  buildReturnObject(self, context, returnObject) {
    let skippedAttributes = {};
    for(let attr of this.constructor.SKIP_ATTRIBUTES) {
      let value = null;
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
      }
      skippedAttributes[attr] = value;
    }

    console.log(self.insertRow);
    returnObject[this.constructor.PLURAL] = {
      [context.insertIds[this.constructor.ATTR_ID]]: {
        [this.constructor.ATTR_ID]: context.insertIds[this.constructor.ATTR_ID],
        ...self.insertRow,
        ...skippedAttributes
      }
    }
  }
  
  async recursivelyCall(classes, shouldAwait, methodName, ...args) {
    for(let cls of classes) {
      shouldAwait ? await cls[methodName](...args) : cls[methodName](...args);
    }
  }

}

AbstractModelAdd.PARENT;

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
