'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('./logger');
const CONSTANTS = require('./constants');
const Utils = require('./utils');

class GenericFind {
  static async find(criteria) {
    if(_.isNil(criteria)) criteria = {};
    logger.debug(this.name, ' #find() criteria:', criteria);
    let context = {};
    this.validateCriteria(context, criteria);

    this.initQuery(context, criteria);
    this.setQueryJoin(context, criteria);
    this.setQueryWhere(context, criteria);
    this.cloneQueryWhereIntoQueryCount(context, criteria);
    this.setQueryWhereDefaultFields(context, criteria);
    this.setQueryWhereAdditionalFields(context, criteria);
    this.setQueryCountFields(context, criteria);
    this.setQueryLimitAndOffset(context, criteria);
    this.setQueryGroup(context, criteria);
    this.stringifyQuery(context, criteria);

    await this.executeQuery(context, criteria);

    let returnObject = {};
    this.buildReturnObjectWhere(returnObject, context, criteria);
    this.buildReturnObjectCount(returnObject, context, criteria);
    return returnObject;

  }

  static validateCriteria(context, criteria) {
    context.fields = criteria.fields || false;
  }

  static initQuery(context, criteria) {
    // Init queries, we need two query objects, because we need a subquery which
    // counts the total rows we could get for this query. Basically the counting
    // query ignores the limit part and uses the COUNT() function in sqlite.
    // To make it easier we first set everything which is the same for both queries
    // to queryWhere and clone it into queryCount. So we have to do things only once.
    context.queryWhere = squel.select().from(this.table, this.table);
    context.queryCount;
  }

  static setQueryJoin(context, criteria) {

  }

  static setQueryWhere(context, criteria) {
    Utils.setWhere(context.queryWhere, this.allowedFields, criteria);
  }

  static cloneQueryWhereIntoQueryCount(context, criteria) {
    context.queryCount = context.queryWhere.clone();
  }

  static setQueryWhereDefaultFields(context, criteria) {
    // For queryWhere we always have to set familyId, because it's needed
    // for the object key.
    context.queryWhere.field(this.idField);
  }

  static setQueryWhereAdditionalFields(context, criteria) {
    // We only have to set fields specified if options.fields, otherwise all.
    Utils.setFields(context.queryWhere, this.fieldAliases, context.fields);

  }

  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(' + this.idField + ')', 'count');
  }

  static setQueryLimitAndOffset(context, criteria) {
    // Set LIMIT and OFFSET for queryWhere (and only for queryWhere)
    Utils.setLimitAndOffset(context.queryWhere, criteria);
  }

  static setQueryGroup(context, criteria) {

  }

  static stringifyQuery(context, criteria) {
    // Stringify queries
    context.queryWhere = context.queryWhere.toString(); // make queryWhereuery a string
    logger.debug(this.name, '#find() queryWhere:', context.queryWhere);
    context.queryCount = context.queryCount.toString();
    logger.debug(this.name, '#find() queryCount:', context.queryCount);
  }

  static async executeQuery(context, criteria) {
    // Now we will execute both queries and catch the results
    [context.rowsWhere, context.rowCount] = await Promise
      .all([sqlite.all(context.queryWhere), sqlite.get(context.queryCount)]);

    logger.debug(this.name, '#find() rowsWhere:', context.rowsWhere);
    logger.debug(this.name, '#find() rowCount:', context.rowCount);
  }

  static buildReturnObjectWhere(returnObject, context, criteria) {

  }

  static buildReturnObjectCount(returnObject, context, criteria) {
    logger.debug(this.name, '#find() length RowsWhere:', context.rowsWhere.length);
    Utils.addFoundAndRemainingFromCountToReturnObject(
      context.rowCount,
      context.rowsWhere.length,
      returnObject,
      criteria
    );

  }
}

GenericFind.table;
GenericFind.allowedFields;
GenericFind.idField;
GenericFind.fieldAliases;

module.exports = GenericFind;
