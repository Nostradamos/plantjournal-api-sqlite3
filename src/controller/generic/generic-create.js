'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../../logger');
const Utils = require('../../utils/utils');

var i = 0;

/**
 * Generic create class which is the skeleton for all *-create classes.
 * It defines some general static methods which will called in a specific
 * order (see create()). Besides that this class also does some simple stuff
 * which most *-create classes would have to do too (eg. basic logging,
 * initing query object... )
 * @private
 */
class GenericCreate {

  /**
   * This function executes the whole create process.
   * This method is a bit more complex, but the problem it tries to solve is
   * that we want to be able to create a Generation and a Family in one request
   * (same for Genotype, Generation and Family or only a Plant and a Genotype).
   * We solve this by doing two things before:
   * 1. We outsource the creation logic for each own model
   * (Family, Generation...) into it's own sub class of GenericCreate
   * 2. Each sub class of GenericCreate needs to specify the .PARENT class
   * attribute which should reference the PARENT creation class if possible.
   * Eg: GenerationCreate.PARENT = FamilyCreate
   * Now we can resolve the so called "callStack", which just follows the
   * this.PARENT references until this.PARENT is undefined/false (this is done
   * in the Utils.getSelfsAndCallStack method). And we create for each element
   * in the stack (a create class) an own self object, which is a "private"
   * namespace where only the create class itself has access to, and a context
   * namespace where every create class in the callstack has access to.
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
   * Family. Therefore we can safely remove both of them from the stack and don't
   * call the class methods without any effect.
   * @async
   * @param {object} options
   *        Object which should hold enough information to create a new entry
   *        with.
   * @throws {Error}
   * @return {object}
   *        returnObject, should contain information about created record.
   */
  static async create(options) {
    Utils.throwErrorIfNotConnected();

    logger.debug(`${this.name} #create() options:`, JSON.stringify(options));
    Utils.hasToBeAssocArray(options);

    let [selfs, callStack] = Utils.getSelfsAndCallStack(this);
    logger.debug(
      `${this.name} #create() callStack:`, _.map(callStack, e => e.name));

    const functions = [
      'validate',
      'initQuery',
      'setQueryFields',
      'setQueryCreatedAtAndModifiedAtFields',
      'stringifyQuery',
      'beginTransaction',
      'executeQuery',
      'endTransaction',
      'buildReturnObject'
    ];

    let context = {
      options,
      returnObject: {},
      createdAt: Utils.getUnixTimestampUTC()
    };

    for(let f of functions) {
      let shouldAwait = _.indexOf(
        ['beginTransaction', 'executeQuery', 'endTransaction'], f) !== -1;

      for(let i=0;i<callStack.length;i++) {
        let removeFromCallStack;
        try {
          logger.debug(this.name, `#create() executing ${shouldAwait ? 'await' : ''} ${callStack[i].name}.${f}`);
          removeFromCallStack = shouldAwait ?
            await callStack[i][f](selfs[i], context) :
            callStack[i][f](selfs[i], context);
        } catch(err) {
          // Make this error more readable
          if(err.message === 'callStack[i][f] is not a function') {
            throw new Error(`Could not execute ${callStack[i].name}.${f}`)
          }
          throw err;
        }

        if(removeFromCallStack === 1) {
          [selfs, callStack] = [selfs.splice(i+1), callStack.splice(i+1)];
        }

        // Make sure we execute begin/endTransaction only once
        if(f === 'beginTransaction' || f === 'endTransaction') break;
      }
    }

    logger.debug(this.name, '#create() returnObject:', JSON.stringify(context.returnObject));
    return context.returnObject;
  }

  /**
   * Overwrite this method to validate all properties in options.
   * Eg: making sure a property has a specific type or is set...
   * If something isn't valid, throw an error.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
static validate(self, context) {
}

/**
   * This function inits the self.query squel object.
   * By default it will be an insert query and the table will be this.TABLE.
   * Overwrite this if you want to init more than one query or you're not happy
   * with the default behaviour.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
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
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
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

    // set id field
    self.query.set(this.ATTR_ID, null);
  }

  /**
   * Set createdAt and modifedAt attributes to self.query.
   * Overwrite this if you have different query names or multiple queries.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @param  {UnixTimestampUTC} context.createdAt
   *         Unix timestamp which should indicate when we created this record.
   */
  static setQueryCreatedAtAndModifiedAtFields(self, context) {
    logger.debug(this.name, '#setQueryCreatedAtAndModifiedAt() createdAt:', context.createdAt);
    self.query
      .set(this.ATTR_CREATED_AT, context.createdAt)
      .set(this.ATTR_MODIFIED_AT, context.createdAt);
  }

  /**
   * This method stringifies self.query and logs the value of it.
   * Overwrite this method if you have to stringify more than one query
   * or if you named the query differently.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {squel}  self.query
   *         Query object
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static stringifyQuery(self, context) {
    self.query = self.query.toString();
    logger.debug(this.name, '#stringify() query:', self.query);
  }

  /**
   * Begins a new transaction. This is needed to perform rollbacks. See sqlite
   * transactions for more information.
   * NOTE: Because we always only execute the first beginTransaction in our
   * callStack. it will have weird effects if you try to overwrite this method.
   * Just don't :)
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static async beginTransaction(self, context) {
    logger.debug(this.name, '#beginTransaction() BEGIN');
    await sqlite.get('BEGIN');
  }

  /**
   * Rollback the transaction. This undos all inserted rows (if any happend).
   * Will be called from #executeQuery().
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static async rollbackTransaction(self, context) {
    logger.debug(this.name, '#rollbackTransaction() ROLLBACK');
    await sqlite.get('ROLLBACK');
  }

  /**
   * Ends/commits the transaction.
   * NOTE:Should only be called once in the whole create prcoess.
   * NOTE: Because we always only execute the first beginTransaction in our
   * callStack. it will have weird effects if you try to overwrite this method.
   * Just don't :)
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static async endTransaction(self, context) {
    logger.debug(this.name, '#endTransaction() COMMIT');
    await sqlite.get('COMMIT');
  }

  /**
   * This method passes the self.query query string to the sqlite api and
   * saves the result in self. If errors happend during query execution, we
   * will try to roll back and undo inserts.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   *         Throws all sql errors
   */
  static async executeQuery(self, context) {
    logger.debug(this.name, '#execute() Executing sql query');

    try {
      self.result = await sqlite.run(self.query);
    } catch(err) {
      // If error happend while rolling back, roll back.
      this.rollbackTransaction(self, context);
      throw err;
    }

    self.insertId = context.result.stmt.lastID;
    logger.debug(this.name, '#execute() result:', context.result);
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
     *         callStack.
     * @param  {object} context
     *         Namespace/object of this creation process. It's shared across
     *         all classes in callStack.
     */
  static buildReturnObject(self, context) {
    let recordObject = {};
    for (let attr of this.ATTRIBUTES) {
      if (!_.isUndefined(context[attr])) {
        recordObject[attr] = context[attr];
      } else if (!_.isUndefined(context.options[attr])) {
        recordObject[attr] = context.options[attr];
      } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        recordObject[attr] = this.DEFAULT_VALUES_ATTRIBUTES[attr];
      } else {
        recordObject[attr] = null;
      }
    }

    recordObject[this.ATTR_ID] = self.insertId;
    recordObject[this.ATTR_CREATED_AT] = context.createdAt;
    recordObject[this.ATTR_MODIFIED_AT] = context.createdAt;

    context.returnObject[this.PLURAL] = {
      [self.insertId]: recordObject
    };
  }
}

GenericCreate.PARENT = false;

// set this field for the default table name used in #initQuery()
GenericCreate.TABLE = null;

GenericCreate.ATTR_ID;

GenericCreate.ATTR_CREATED_AT;

GenericCreate.ATTR_MODIFIED_AT;

GenericCreate.ATTRIBUTES = [];

GenericCreate.SKIP_ATTRIBUTES = [];

GenericCreate.DEFAULT_VALUES_ATTRIBUTES = [];

GenericCreate.PLURAL;


module.exports = GenericCreate;
