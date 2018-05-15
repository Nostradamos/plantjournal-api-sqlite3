'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../../logger');
const Utils = require('../../utils/utils');
const UtilsTransactions = require('../../utils/utils-transactions');

/**
 * @typedef  {Object} classStackAndSelfs
 *           Object containing self scopes and classStack classes for creation
 *           process.
 * @property {Object[]} selfs
 *           Array of objects which represent the self scopes for the different
 *           classStack scopes.
 * @property {Object[]} classStack
 *           Array of Objects which should be Classes which are child of
 *           GenericAdd.
 */


/**
 * Generic create class which is the skeleton for all *-add classes.
 * It defines some general static methods which will called in a specific
 * order (see create()). Besides that this class also does some simple stuff
 * which most *-add classes would have to do too (eg. basic logging,
 * initing query object... )
 * @private
 */
class GenericAdd {

  /**
   * This function executes the whole create process.
   * This method is a bit more complex, but the problem it tries to solve is
   * that we want to be able to create a Generation and a Family in one request
   * (same for Genotype, Generation and Family or only a Plant and a Genotype).
   * We solve this by doing two things before:
   * 1. We outsource the creation logic for each own model
   * (Family, Generation...) into it's own sub class of GenericAdd
   * 2. Each sub class of GenericAdd needs to specify the .PARENT class
   * attribute which should reference the PARENT creation class if possible.
   * Eg: GenerationAdd.PARENT = FamilyAdd
   * Now we can resolve the so called "classStack", which just follows the
   * this.PARENT references until this.PARENT is undefined/false (this is done
   * in the Utils.getSelfsAndclassStack method). And we create for each element
   * in the stack (a create class) an own self object, which is a "private"
   * namespace where only the create class itself has access to, and a context
   * namespace where every create class in the classStack has access to.
   * Now we can execute a set of hard coded functions (validate, initQuery...).
   * We do this like this, we first execute the first function on the first
   * element in the call stack, than the same function on the second element...
   * until we execute this one function for all classes in the stack. Than we
   * proceed to the next function, and do it again. While doing this, we pass
   * the class specific self and the unspecific context object/namespace to the
   * static class function. We also make sure to not execute the
   * begin/endTransaction methods multiple times and we also make sure that we
   * execute the async functions with await. If the called function returns a
   * 1, we remove the class from the stack, and all classes before that one.
   * The reason for that is, that if we for example don't have enough data to
   * create a Generation, we also wont have enough information to create a
   * Family. Therefore we can safely remove both of them from the stack and
   * don't call the class methods without any effect.
   * @async
   * @param {object} options
   *        Object which should hold enough information to create a new entry
   *        with.
   * @throws {Error}
   * @return {object}
   *        returnObject, should contain information about created record.
   */
  static async add(options) {
    Utils.throwErrorIfNotConnected();

    logger.debug(`${this.name} #create() options:`, JSON.stringify(options));
    Utils.hasToBeAssocArray(options);

    let context = {
      options,
      returnObject: {},
      createdAt: Utils.getDatetimeUTC(),
      creatingClassName: this.name,
      insertIds: {},
    };

    let classStackAndSelfs = this.resolveClassStackAndBuildSelfs(context);

    logger.debug(`${this.name} #create() classStack:`, _.map(classStackAndSelfs.classStack, e => e.name));

    classStackAndSelfs = await this
      .callClassStackValidationMethods(classStackAndSelfs, context);

    await this.callClassStackRemainingMethods(classStackAndSelfs, context);


    logger.debug(this.name, '#create() returnObject:', JSON.stringify(context.returnObject));
    return context.returnObject;
  }

  /**
   * Resolved the class call stack and builds the self scope array.
   * NOTE: In case you need to modify a self scope object or the class call
   * stack, overwrite this method.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @return {classStackAndSelfs}
   *         classStackAndSelfs object
   */
  static resolveClassStackAndBuildSelfs(context) {
    let [selfs, classStack] = Utils.getSelfsAndClassStack(this);
    return {selfs, classStack};
  }

  /**
   * Calls the validate method of each Class in classStack. We do this in a
   * DECREASING order, to fail on the first Parent class and then remove
   * the parent and all it's parents from classStack and the related self
   * scopes. We return the modified selfs & classStack.
   * @param {classStackAndSelfs} classStackAndSelfs
   *         classStackAndSelfs object
   * @param  {Object}  context
   *         Context object for this insert/create request.
   * @return {classStackAndSelfs}
   *         classStackAndSelfs object
   */
  static async callClassStackValidationMethods(classStackAndSelfs, context) {
    let selfs = classStackAndSelfs.selfs;
    let classStack = classStackAndSelfs.classStack;

    // Call all validate methods in decreasing order
    for(let i=classStack.length-1;i>=0;i--) {
      logger.debug(this.name, `#create() executing ${classStack[i].name}.validate`);
      let removeFromClassStack = await this._callClassStackMethod(
        classStack, selfs, context, i, 'validate', false);

      if(removeFromClassStack === true) {
        logger.debug(this.name, `#create() removing ${classStack[i].name} and it's parents from classStack`);
        [selfs, classStack] = [_.slice(selfs, i+1), _.slice(classStack, i+1)];
        break;
      }
    }

    return {selfs, classStack};
  }

  /**
   * Calls all remaining methods specified in
   * GenericAdd.CLASS_CALL__STACK_ORDER.
   * We do this in an INCREASING order, where we call each method for
   * each class, and then continuing with the next class call stack method.
   * @param {classStackAndSelfs} classStackAndSelfs
   *         classStackAndSelfs object
   * @param  {Object} context
   *         Context object for this insert/create request.
   */
  static async callClassStackRemainingMethods(classStackAndSelfs, context) {
    let selfs = classStackAndSelfs.selfs;
    let classStack = classStackAndSelfs.classStack;

    // Call each other function in increasing order
    for(let f of this.CLASS_CALL_STACK_ORDER) {
      let shouldAwait = _.indexOf(
        ['beginTransaction', 'executeQuery', 'endTransaction'], f) !== -1;

      for(let i=0;i<classStack.length;i++) {
        logger.debug(this.name, `#create() executing ${shouldAwait ? 'await' : ''} ${classStack[i].name}.${f}`);
        await this._callClassStackMethod(
          classStack, selfs, context, i, f, false);

        // Make sure we execute begin/endTransaction only once
        if(f === 'beginTransaction' || f === 'endTransaction') break;
      }
    }
  }

  /**
   * Helper method to call a classStack Method and return it's return value.
   * This method allows us to await the method or normally call it, and we catch
   * an unreadable error code and throw it readable again.
   * @param  {GenericAdd[]}  classStack
   *         classStack Object
   * @param  {Object[]}  selfs
   *         selfs object
   * @param  {Object}  context
   *         context object
   * @param  {Integer}  i
   *         Integer which indicates the index of the class reference in
   *         classStack from which we should call f.
   * @param  {String}  f
   *         Name of the function to execute
   * @param  {Boolean}  shouldAwait
   *         Set to true if we want to await the result
   * @return {Object}
   *         Return whatever the called method returned.
   */
  static async _callClassStackMethod(
    classStack, selfs, context, i, f, shouldAwait) {
    let fnc = classStack[i][f].bind(classStack[i]);
    let self = selfs[i];

    let returnValue;
    try {
      returnValue = shouldAwait ? await fnc(self, context) : fnc(self, context);
    } catch(err) {
      // Make this error more readable
      if(err.message === 'classStack[i][f] is not a function') {
        throw new Error(`Could not execute ${classStack[i].name}.${f}`);
      }
      throw err;
    }
    return returnValue;
  }

  /**
   * This method should check if all properties for creating this record are
   * valid and make sure, that this record even needs to be created. Because
   * We can create a Family from a GenerationAdd, we need to make sure
   * that familyId isn't already set, and if so, abort this whole creation
   * process by removing us and our parents from the classStack. Sounds
   * complicate, but you just need to return true to remove us and our parents
   * from the classStack :)
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @return {Boolean}
   *         Return true if we don't need to insert this record and this class
   *         reference and it's parents should get deleted from the classStack.
   */
  static validate(self, context) {
    return false;
  }

  /**
   * This function inits the self.query squel object.
   * By default it will be an insert query and the table will be this.TABLE.
   * Overwrite this if you want to init more than one query or you're not happy
   * with the default behaviour.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static initQuery(self, context) {
    self.query = squel.insert().into(this.TABLE);
  }

  /**
   * We iterate over all this.ATTRIBUTES and look if we can get the
   * information from somewhere. We first look if attribute is set in context,
   * next if in options, next in DEFAULT_VALUES_ATTRIBUTES and if we still
   * didn't find it, set it to null. We also set the id field here.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static setQueryFields(self, context) {
    for(let attr of this.ATTRIBUTES) {
      if (_.indexOf(this.SKIP_ATTRIBUTES, attr) !== -1) {
        continue;
      } else if (!_.isUndefined(context[attr])) {
        self.query.set(attr, context[attr]);
      } else if (!_.isUndefined(context.options[attr])) {
        self.query.set(attr, context.options[attr]);
      } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        self.query.set(attr, this.DEFAULT_VALUES_ATTRIBUTES[attr]);
      } else {
        self.query.set(attr, null);
      }
    }

    let parentPrimaryKey = this.PARENT.ATTR_ID;
    if(parentPrimaryKey && !context.options[parentPrimaryKey]) {
      self.query.set(parentPrimaryKey, '$parentId', {dontQuote: true});
    }

    // set id field
    self.query.set(this.ATTR_ID, null);
  }

  /**
   * Set createdAt and modifedAt attributes to self.query.
   * Overwrite this if you have different query names or multiple queries.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @param  {DatetimeUTC} context.createdAt
   *         UTC Datetime which should indicate when we created this record.
   */
  static setQueryAddedAtAndModifiedAtFields(self, context) {
    logger.debug(this.name, '#setQueryAddedAtAndModifiedAt() createdAt:', context.createdAt);
    self.query
      .set(this.ATTR_ADDED_AT, context.createdAt)
      .set(this.ATTR_MODIFIED_AT, context.createdAt);
  }

  /**
   * This method stringifies self.query and logs the value of it.
   * Overwrite this method if you have to stringify more than one query
   * or if you named the query differently.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {squel}  self.query
   *         Query object
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static stringifyQuery(self, context) {
    self.query = self.query.toString();
    logger.debug(this.name, '#stringify() query:', self.query);
  }

  /**
   * Begins a new transaction. This is needed to perform rollbacks. See sqlite
   * transactions for more information.
   * NOTE: Because we always only execute the first beginTransaction in our
   * classStack. it will have weird effects if you try to overwrite this method.
   * Just don't :)
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static async beginTransaction(self, context) {
    logger.debug(this.name, '#beginTransaction() BEGIN');
    await UtilsTransactions.beginTransaction();
  }

  /**
   * Rollback the transaction. This undos all inserted rows (if any happend).
   * Will be called from #executeQuery().
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static async rollbackTransaction(self, context) {
    logger.debug(this.name, '#rollbackTransaction() ROLLBACK');
    await UtilsTransactions.rollbackTransaction();
  }

  /**
   * Ends/commits the transaction.
   * NOTE:Should only be called once in the whole create prcoess.
   * NOTE: Because we always only execute the first beginTransaction in our
   * classStack. it will have weird effects if you try to overwrite this method.
   * Just don't :)
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  static async endTransaction(self, context) {
    logger.debug(this.name, '#endTransaction() COMMIT');
    await UtilsTransactions.endTransaction();
  }

  /**
   * This method passes the self.query query string to the sqlite api and
   * saves the result in self. If errors happend during query execution, we
   * will try to roll back and undo inserts.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @throws {Error}
   *         Throws all sql errors
   */
  static async executeQuery(self, context) {
    let parentId = context.insertIds[this.PARENT.ATTR_ID];
    let placeholders = parentId ?
      {$parentId: parentId} :
      {};

    try {
      self.result = await this._executeQuery(
        self, context, self.query, placeholders);
    } catch(err) {
      throw err;
    }

    context.insertIds[this.ATTR_ID] = self.insertId = self.result.stmt.lastID;
  }

  /**
   * Helper method which executes a query string and returns the sqlite result
   * object.
   * We make sure to safely rollback if we encounter an error.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @param  {String} query
   *         SQLite Query string.
   * @param  {Object} placeholders
   *         Any valid placeholders which you can pass to sqlite.run().
   * @throws {Error}
   *         Throws all sql errors
   * @return {Object}
   *         Sqlite result
   */
  static async _executeQuery(self, context, query, placeholders) {
    logger.debug(this.name, '#_executeQuery() Executing sql query:', query, 'placeholders:', placeholders);

    let result;
    try {
      result = await sqlite.run(query, placeholders);
    } catch(err) {
      // If error happend while rolling back, roll back.
      logger.error(this.name, '#_executeQuery()', err);
      this.rollbackTransaction(self, context);
      throw err;
    }
    logger.debug(this.name, '#_executeQuery() result:', result);
    return result;
  }
  /**
     * This method builds the returnObject by iterating over all ATTRIBUTES
     * and trying to retrieve the information either from self, context or
     * DEFAULT_VALUES_ATTRIBUTES. We also add internal attributes.
     * The so called `recordObject` will be in
     * returnObject[plural][insertId]. returnObject is the object returned
     * from #create().
     * @param  {object} self
     *         Namespace/object only for the context of this class and this
     *         creation process. Not shared across differenct classes in
     *         classStack.
     * @param  {object} context
     *         Namespace/object of this creation process. It's shared across
     *         all classes in classStack.
     */
  static buildReturnObject(self, context) {
    let recordObject = {};
    for (let attr of this.ATTRIBUTES) {
      if (!_.isUndefined(context[attr])) {
        recordObject[attr] = context[attr];
      } else if (attr === this.ATTR_FILL_CHILD_IDS) {
        recordObject[attr] = this.ATTR_CHILD_ID in context.insertIds ?
          [context.insertIds[this.ATTR_CHILD_ID]] :
          [];
      } else if (!_.isUndefined(context.insertIds[attr])){
        recordObject[attr] = context.insertIds[attr];
      } else if (!_.isUndefined(context.options[attr])) {
        recordObject[attr] = context.options[attr];
      } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        recordObject[attr] = this.DEFAULT_VALUES_ATTRIBUTES[attr];
      } else {
        recordObject[attr] = null;
      }
    }

    recordObject[this.ATTR_ID] = self.insertId;
    recordObject[this.ATTR_ADDED_AT] = context.createdAt;
    recordObject[this.ATTR_MODIFIED_AT] = context.createdAt;

    context.returnObject[this.PLURAL] = {
      [self.insertId]: recordObject
    };
  }
}

GenericAdd.CLASS_CALL_STACK_ORDER = [
  'initQuery',
  'setQueryFields',
  'setQueryAddedAtAndModifiedAtFields',
  'stringifyQuery',
  'beginTransaction',
  'executeQuery',
  'endTransaction',
  'buildReturnObject'
];

GenericAdd.PARENT = false;

// set this field for the default table name used in #initQuery()
GenericAdd.TABLE = null;

GenericAdd.ATTR_ID;

GenericAdd.ATTR_ADDED_AT;

GenericAdd.ATTR_MODIFIED_AT;

GenericAdd.ATTR_FILL_CHILD_IDS;

GenericAdd.ATTR_CHILD_ID;

GenericAdd.ATTRIBUTES = [];

GenericAdd.SKIP_ATTRIBUTES = [];

GenericAdd.DEFAULT_VALUES_ATTRIBUTES = [];

GenericAdd.PLURAL;

module.exports = GenericAdd;
