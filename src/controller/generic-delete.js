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

    this.initQueryRelated(context, criteria);
    this.setQueryRelatedJoin(context, criteria);
    this.setQueryRelatedFields(context, criteria);
    this.setQueryRelatedWhere(context, criteria);
    this.setQueryRelatedLimitAndOffset(context, criteria);
    this.stringifyQueryRelated(context, criteria);

    await this.executeQueryRelated(context, criteria);

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

    static initQueryRelated(context, criteria) {
    context.queryRelated = squel
      .select()
      .from(this.table, this.table)
  }

  static setQueryRelatedJoin(context, criteria) {

  }


  static setQueryRelatedFields(context, criteria) {
  }

  static setQueryRelatedWhere(context, criteria) {
    Utils.setWhere(context.queryRelated, this.allowedFields, criteria);
  }


  static setQueryRelatedLimitAndOffset(context, criteria) {
    if(criteria.limit) context.queryRelated.limit(criteria.limit);
    if(criteria.offset) context.queryRelated.offset(criteria.offset);
  }

  static stringifyQueryRelated(context, criteria) {
    context.queryRelated = context.queryRelated.toString();
    logger.debug(this.name, '#delete() queryRelated:', context.queryRelated);
  }

  static async executeQueryRelated(context, criteria) {
    context.rowsRelated = await sqlite.all(context.queryRelated);
    logger.debug(this.name, '#delete() rowsRelated:', context.rowsRelated);
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
