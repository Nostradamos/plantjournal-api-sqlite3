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
     * This function executes the complete create process.
     * In the best case, don't try to overwrite this method if you extend
     * GenericCreate. Prefer to overwrite any of the called child methods
     * (validateBefore, validate, ...buildReturnObject)
     * @async
     * @param {object} options
     *        Object which should hold enough information to create
     *        a new entry with.
     * @throws {Error}
     * @return {object}
     *        returnObject, should normally contain information about created
     *        record.
     */
  static async create(options) {
    Utils.throwErrorIfNotConnected();
    logger.debug(`${this.name} #create() options:`, JSON.stringify(options));

    Utils.hasToBeAssocArray(options);

    let [selfs, callStack] = Utils.getSelfsAndCallStack(this);
    logger.debug(`${this.name} #create() callStack:`, _.map(callStack, e => e.name));

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

    let context = {options, returnObject: {}, insertId: {}, i: i+1};

    for(let f of functions) {
      let shouldAwait = _.indexOf(
        ['beginTransaction', 'executeQuery', 'endTransaction'], f) !== -1;
      for(let i=0;i<callStack.length;i++) {
        let removeFromCallStack;
        try {
          logger.debug(this.name, `#create() executing ${shouldAwait ? 'await' : ''} ${callStack[i].name}.${f}`)
          removeFromCallStack = shouldAwait ?
            await callStack[i][f](selfs[i], context) :
            callStack[i][f](selfs[i], context);
        } catch(err) {
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
     * Use this method for validating the options parameter itself. Normally
     * You should only make sure that it's an assoc array.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static validateOptionsIsAssoc(self, context) {
    Utils.hasToBeAssocArray(options);
  }

  /**
     * Overwrite this method to validate all properties in options.
     * Eg: making sure a property has a specific type or is set...
     * If something isn't valid, throw an error.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static validateOptions(self, context) {
  }

  /**
     * This function inits the context.query squel object.
     * By default it will be an insert query and the table will
     * be this.TABLE.
     * Overwrite this if you want to init more than one query or you're
     * not happy with the default behaviour.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static initQuery(self, context) {
    context.query = squel.insert().into(this.TABLE);
  }

  /**
     * We iterate over all this.ATTRIBUTES and look if we can get the
     * information from somewhere. We first look if attribute is set in context,
     * next if in options, next in DEFAULT_VALUES_ATTRIBUTES and if we still
     * didn't find it, set it to null. We also set the id field here.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static setQueryFields(self, context) {
    for(let attr of this.ATTRIBUTES) {
      if (_.indexOf(this.SKIP_ATTRIBUTES, attr) !== -1) {
        continue;
      } else if (!_.isUndefined(context[attr])) {
        context.query.set(attr, context[attr]);
      } else if (!_.isUndefined(context.options[attr])) {
        context.query.set(attr, context.options[attr]);
      } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        context.query.set(attr, this.DEFAULT_VALUES_ATTRIBUTES[attr]);
      } else {
        context.query.set(attr, null);
      }
    }

    // set id field
    context.query.set(this.ATTR_ID, null);
  }

  /**
     * Set createdAt and modifedAt attributes to query.
     * Overwrite this if you have different query names or multiple queries.
     * For timestamp generation use ONCE Utils.getUnixTimestampUTC()
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static setQueryCreatedAtAndModifiedAtFields(self, context) {
    self.createdAt = Utils.getUnixTimestampUTC();
    logger.debug(this.name, '#setQueryCreatedAtAndModifiedAt() createdAt:', self.createdAt);

    context.query
      .set(this.ATTR_CREATED_AT, self.createdAt)
      .set(this.ATTR_MODIFIED_AT, self.createdAt);
  }

  /**
     * This method stringifies context.query and logs the value of it.
     * Overwrite this method if you have to stringify more than one query
     * or if you named the query differently.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
  static stringifyQuery(self, context) {
    context.query = context.query.toString();
    logger.debug(this.name, '#stringify() query:', context.query);
  }

  static async beginTransaction(self, context) {
    logger.debug(this.name,  '#beginTransaction() BEGIN');
    await sqlite.get('BEGIN');
  }

  static async rollbackTransaction(self, context) {
    logger.debug(this.name,  '#rollbackTransaction() ROLLBACK');
    await sqlite.get('ROLLBACK');
  }

  static async endTransaction(self, context) {
    logger.debug(this.name, context.i, '#endTransaction() COMMIT');
    await sqlite.get('COMMIT');
  }

  /**
     * In case your query is named differently or you have to do more advanced
     * stuff, Overwrite this method.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Throws all sql errors
     */
  static async executeQuery(self, context) {
    logger.debug(this.name, context.i, '#execute() Executing sql query');
    context.result = await sqlite.run(context.query);
    self.insertId = context.result.stmt.lastID;
    logger.debug(this.name, context.i, '#execute() result:', context.result);
  }

  /**
     * This method builds the returnObject by iterating over all ATTRIBUTES
     * and trying to retrieve the information either from self, context or
     * DEFAULT_VALUES_ATTRIBUTES. We also add internal attributes.
     * The so called `recordObject` will be in
     * returnObject[plural][insertId]. returnObject is the object returned
     * from #create().
     * @param  {object} returnObject
     *         object which will later get returned from #create().
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
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
    recordObject[this.ATTR_CREATED_AT] = self.createdAt;
    recordObject[this.ATTR_MODIFIED_AT] = self.createdAt;

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
