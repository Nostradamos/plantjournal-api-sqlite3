'use strict';

const logger = require('./logger');
const squel = require('squel');
const sqlite = require('sqlite');
const Utils = require('./utils');
const Constants = require('./constants');

class GenericCreate {
  static async create(options) {
    logger.debug(this.name, '#create() options:', options);
    let context = {};
    this.validateBefore(context, options);
    this.validate(context, options);
    this.validateAfter(context, options);

    this.buildQueryBefore(context, options);
    this.buildQuery(context, options);
    this.buildQueryAfter(context, options);

    await this.executeQuery(context, options);

    let returnObject = {};

    this.buildReturnObject(returnObject, context, options);
    logger.debug(this.name, '#create() returnObject:', returnObject);

    return returnObject;
  }

  static validateBefore(context, options) {
    Utils.hasToBeAssocArray(options);
  }

  static validate(context, options) {
  }

  static validateAfter(context, options) {
  }

  static buildQueryBefore(context, options) {
    context.query = squel.insert().into(this.table);
  }

  static buildQuery(context, options) {
  }

  static buildQueryAfter(context, options) {
    context.query = context.query.toString();
    logger.debug(this.name, '#create() query:', context.query);
  }

  static async executeQuery(context, options) {
    context.result = await sqlite.run(context.query);
    context.insertId = context.result.stmt.lastID;
  }

  static buildReturnObject(returnObject, context, options) {
  }
}

GenericCreate.prototype.table = null;
GenericCreate.prototype.name = "GenericCreate";

module.exports = GenericCreate;
