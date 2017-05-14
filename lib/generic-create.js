'use strict';

const logger = require('./logger');
const squel = require('squel');
const sqlite = require('sqlite');
const Utils = require('./utils');
const Constants = require('./constants');

/**
 * Generic create class which is the skeleton for all *-create classes.
 * It defines some general static methods which will get called in a specific
 * order (see create()). Besides that this class also does some simple stuff
 * which most *-create classes would have to do too (eg. basic logging,
 * initing query object... )
 */
class GenericCreate {

  /**
   * This function executes the complete create process.
   * In the best case, don't try to overwrite this method if you extends
   * GenericCreate. Prefer to overwrite any of the called child methods
   * (validateBefore, validate, ...buildReturnObject)
   * @param {object} options
   * @return {object} returnObject
   */
  static async create(options) {
    logger.debug(this.name, '#create() options:', options);
    let context = {};
    this.validateBefore(context, options);
    this.validate(context, options);
    this.validateAfter(context, options);

    this.initQuery(context, options);
    this.buildQuery(context, options);
    this.stringifyQuery(context, options);

    await this.executeQueryBefore(context, options);
    await this.executeQuery(context, options);
    await this.executeQueryAfter(context, options);

    let returnObject = {};

    this.buildReturnObject(returnObject, context, options);
    logger.debug(this.name, '#create() returnObject:', JSON.stringify(returnObject));

    return returnObject;
  }

  /**
   * Use this method for validating the options parameter itself. Normally
   * You should only make sure that it's an assoc array.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static validateBefore(context, options) {
    Utils.hasToBeAssocArray(options);
  }

  /**
   * Overwrite this method to validate all properties in options.
   * Eg: making sure a property has a specific type or is set...
   * If something isn't valid, throw an error.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static validate(context, options) {
  }

  /**
   * Currently not used, but maybe we have to validate something after
   * validate. Maybe this will get removed.
   * ToDo: Delete?!
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static validateAfter(context, options) {
  }

  /**
   * This function inits the context.query squel object.
   * By default it will be an insert query and the table will
   * be this.table.
   * Overwrite this if you want to init more than one query or you're
   * not happy with the default behaviour.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static initQuery(context, options) {
    context.query = squel.insert().into(this.table);
  }

  /**
   * Overwrite this method to apply all fields and stuff to your queries.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static buildQuery(context, options) {
  }

  /**
   * This method stringifies context.query and logs the value of it.
   * Overwrite this method if you have to stringify more than one query
   * or if you named the query differently.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static stringifyQuery(context, options) {
    context.query = context.query.toString();
    logger.debug(this.name, '#create() query:', context.query);
  }

  /**
   * In case you have to execute a query before the main query, Overwrite
   * this method to do so.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   * @return {Promise}         [description]
   */
  static async executeQueryBefore(context, options) {

  }

  /**
   * In case your query is named differently or you have to do more advanced
   * stuff, Overwrite this method.
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   * @return {Promise}         [description]
   */
  static async executeQuery(context, options) {
    context.result = await sqlite.run(context.query);
    context.insertId = context.result.stmt.lastID;
    logger.debug(this.name, '#create() result:', context.result);
  }

  /**
   * Currently not used, maybe will get removed.
   * ToDo: Remove?
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   * @return {Promise}         [description]
   */
  static async executeQueryAfter(context, options) {

  }

  /**
   * Overwrite this function to set the properties for the returnObject
   * (object which will get returned from #create())
   * @param  {object} returnObject - object which will get returned from #create()
   * @param  {object} context - internal context object in #create()
   * @param  {object} options - options object passed to #create()
   */
  static buildReturnObject(returnObject, context, options) {
  }
}

//GenericCreate.prototype.name = null;
GenericCreate.prototype.table = null;

module.exports = GenericCreate;
