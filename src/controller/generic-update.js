'use strict';

const squel = require('squel');

const Utils = require('../utils');

class GenericUpdate {

  static async update(update, criteria){
    logger.debug(this.name, '#update() update:', update, 'criteria:', criteria);

    let context = {};

    this.initQueryFind(context, update, criteria);
    this.setQueryFindJoin(context, update, criteria);
    this.setQueryFindFields(context, update, criteria);
    this.setQueryFindWhere(context, update, criteria);
    this.setQueryFindLimitAndOffset(context, update, criteria);
    this.stringifyQueryFind(context, update, criteria);

    await this.executeQueryFind(context, update, criteria);
    this.extractIdsRowsFind(context, update, criteria);


    this.initQueryUpdate(context, update, criteria);
    this.setQueryUpdateFieldValues(context, update, criteria);
    this.stringifyQueryUpdate(context, update, criteria);

    await this.executeQueryUpdate(context, update, criteria);


    let returnObject = {};
    this.buildReturnObject(returnObject, context, update, criteria);

    return returnObject;
  }


  static initQueryFind(context, update, criteria) {
    context.queryFind = squel.select().table(this.TABLE);
  }

  static setQueryFindFields(context, update, criteria) {
  }

  static setQueryFindJoin(context, update, criteria) {
  }


  static setQueryFindWhere(context, update, criteria) {
    Utils.setWhere(context.queryFind, this.FINDABLE_ALIASES, criteria);
  }

  static setQueryFindLimitAndOffset(context, update, criteria) {
    if(criteria.limit) context.queryFind.limit(criteria.limit);
    if(criteria.offset) context.queryFind.offset(criteria.offset);
  }

  static stringifyQueryFind(context, update, criteria) {
    context.queryFind = context.queryFind.toString();

  }

  static async executeQueryFind(context, update, criteria) {
    context.rowsFind = await sqlite.all(context.queryFind);

    logger.debug(this.name, '#update() rowsFind:', context.rowsFind);
  }

  static extractIdsRowsFind(context, update, criteria) {
  }

  static initQueryUpdate(context, update, criteria) {
    context.queryUpdate = squel.update().table(this.TABLE);
  }

  static setQueryUpdateFieldValues(context, update, criteria) {
  }

  static stringifyQueryUpdate(context, update, criteria) {
    context.queryUpdate = context.queryUpdate.toString();

    logger.debug(this.name, '#update() queryUpdate:', context.queryUpdate);
  }

  static async executeQueryUpdate(context, update, criteria) {
    context.resultUpdate = await squlite.get(context.queryUpdate);

    logger.debug(this.name, '#update() resultUpdate:', context.resultUpdate);
  }

  static buildReturnObject(returnObject, context, update, criteria) {
  }
}
