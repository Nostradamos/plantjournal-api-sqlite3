'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const Utils = require('../utils');

class GenericDelete {
  static async delete(criteria) {
    if(_.isNil(criteria)) throw Error('No criteria object passed');
    logger.debug(this.name, ' #delete() criteria:', criteria);
    let context = {};

    this.initQueryWhere(context, criteria);
    this.setQueryWhereIdField(context, criteria);
    this.setQueryWhereWhere(context, criteria);
    this.setQueryWhereJoin(context, criteria);
    this.setQueryWhereLimitAndOffset(context, criteria);
    this.stringifyQueryWhere(context, criteria);

    await this.executeQueryWhere(context, criteria);

    this.extractIdsToDelete(context, criteria);

    this.initQueryDelete(context, criteria);
    this.setQueryDeleteWhere(context, criteria);
    this.stringifyQueryDelete(context, criteria);

    await this.executeQueryDelete(context, criteria);

    let returnObject = {};
    this.buildReturnObject(returnObject, context, criteria);
    logger.log(this.name, '#delete() returnObject:', returnObject);

    return returnObject;

  }

  static initQueryWhere(context, criteria) {
    context.queryWhere = squel
      .select()
      .from(this.table, this.table)
  }

  static setQueryWhereIdField(context, criteria) {
  }

  static setQueryWhereWhere(context, criteria) {
    Utils.setWhere(context.queryWhere, this.allowedFields, criteria);
  }

  static setQueryWhereJoin(context, criteria) {

  }

  static setQueryWhereLimitAndOffset(context, criteria) {
    if(criteria.limit) context.queryWhere.limit(criteria.limit);
    if(criteria.offset) context.queryWhere.offset(criteria.offset);
  }

  static stringifyQueryWhere(context, criteria) {
    context.queryWhere = context.queryWhere.toString();
    logger.debug(this.name, '#delete() queryWhere:', context.queryWhere);
  }

  static async executeQueryWhere(context, criteria) {
    context.rowsWhere = await sqlite.all(context.queryWhere);
    logger.debug(this.name, '#delete() rowsWhere:', context.rowsWhere);
  }

  static extractIdsToDelete(context, criteria) {
  }

  static initQueryDelete(context, criteria) {
    context.queryDelete = squel
      .delete()
      .from(this.table);
  }

  static setQueryDeleteWhere(context, criteria) {
  }

  static stringifyQueryDelete(context, criteria) {
    context.queryDelete = context.queryDelete.toString();
    logger.debug(this.name, '#delete() queryDelete:', context.queryDelete);
  }

  static async executeQueryDelete(context, criteria) {
    context.resultDelete = await sqlite.get(context.queryDelete);
    logger.debug(this.name, '#delete() resultDelete', context.resultDelete);
  }

  static async buildReturnObject(returnObject, context, criteria) {

  }


}

GenericDelete.table;
GenericDelete.allowedFields;

module.exports = GenericDelete;
