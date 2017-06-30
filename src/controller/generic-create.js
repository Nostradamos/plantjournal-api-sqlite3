'use strict';

const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');


/**
 * Generic create class which is the skeleton for all *-create classes.
 * It defines some general static methods which will called in a specific
 * order (see create()). Besides that this class also does some simple stuff
 * which most *-create classes would have to do too (eg. basic logging,
 * initing query object... )
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
   */
  static async create(options) {
    logger.debug(this.name, '#create() options:', options);
    let context = {};
    this.validateOptionsIsAssoc(context, options);
    this.validate(context, options);

    this.initQuery(context, options);
    this.setQueryFields(context, options);
    this.setQueryCreatedAtAndModifiedAt(context, options);
    this.stringifyQuery(context, options);

    await this.executeQuery(context, options);

    let returnObject = {};

    this.buildReturnObject(returnObject, context, options);
    logger.debug(this.name, '#create() returnObject:', JSON.stringify(returnObject));

    return returnObject;
  }

  /**
   * Use this method for validating the options parameter itself. Normally
   * You should only make sure that it's an assoc array.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static validateOptionsIsAssoc(context, options) {
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
  static validate(context, options) {
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
  static initQuery(context, options) {
    context.query = squel.insert().into(this.TABLE);
  }

  /**
   * Overwrite this method to apply all fields your query.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static setQueryFields(context, options) {
  }

  /**
   * Set createdAt and modifedAt fields to query.
   * Overwrite this if you have different query names or multiple queries.
   * For timestamp generation use ONCE Utils.getUnixTimestampUTC()
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static setQueryCreatedAtAndModifiedAt(context, options) {
    context.createdAt = context.modifiedAt = Utils.getUnixTimestampUTC();
    logger.debug(this.name, '#find() createdAt:', context.createdAt,
                 'modifiedAt:', context.modifiedAt);

    context.query
      .set(this.ALIAS_CREATED_AT, context.createdAt)
      .set(this.ALIAS_MODIFIED_AT, context.modifiedAt);
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
  static stringifyQuery(context, options) {
    context.query = context.query.toString();
    logger.debug(this.name, '#create() query:', context.query);
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
  static async executeQuery(context, options) {
    context.result = await sqlite.run(context.query);
    context.insertId = context.result.stmt.lastID;
    logger.debug(this.name, '#create() result:', context.result);
  }

  /**
   * Overwrite this function to set the properties for the returnObject
   * (object which will find returned from #create())
   * @param  {object} returnObject
   *         object which will find returned from #create()
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static buildReturnObject(returnObject, context, options) {
  }
}

// set this field for the default table name used in #initQuery()
GenericCreate.TABLE = null;

GenericCreate.ALIAS_CREATED_AT;

GenericCreate.ALIAS_MODIFIED_AT;

module.exports = GenericCreate;
