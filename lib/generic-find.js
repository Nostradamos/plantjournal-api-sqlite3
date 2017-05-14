'use strict';

const logger = require('./logger');
const squel = require('squel');
const sqlite = require('sqlite');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

class GenericFind {
  static async find(criteria) {
    logger.debug(this.name, ' #find() criteria:', criteria);

    let context = {};
    this.initQuery(context, criteria);
    this.setQueryWhere(context, criteria);
    this.cloneQueryWhereIntoQueryCount(context, criteria);
    this.setQueryFields(context, criteria);
    this.setQueryLimitAndOffset(context, criteria);


  }

  static initQuery(context, criteria) {
    context.queryWhere = squel.select().from(CONSTANTS.TABLE_FAMILIES);
    context.queryCount;
  }

  static setQueryWhere(context, criteria) {

  }

  static cloneQueryWhereIntoQueryCount(context, criteria) {

  }

  static setQueryFields(context, criteria) {

  }

  static setQueryLimitAndOffset(context, criteria) {

  }

  static stringifyQuery(context, criteria) {
    
  }
}
