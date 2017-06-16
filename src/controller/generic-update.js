'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const Utils = require('../utils');

class GenericUpdate {

  static async update(update, criteria){
    logger.debug(this.name, '#update() update:', update, 'criteria:', criteria || undefined);

    // Validate update and criteria arguments
    if(_.isUndefined(update) && _.isUndefined(criteria)) throw new Error('No Update and Critera Object got passed');
    if(_.isUndefined(criteria)) throw new Error('No Criteria Object got passed');
    Utils.hasToBeAssocArray(update, 'Update Object');
    Utils.hasToBeAssocArray(criteria, 'Criteria Object');

    let context = {};

    this.initQueryFind(context, update, criteria);
    this.setQueryFindJoin(context, update, criteria);
    this.setQueryFindIdField(context, update, criteria);
    this.setQueryFindWhere(context, update, criteria);
    this.setQueryFindLimitAndOffset(context, update, criteria);
    this.stringifyQueryFind(context, update, criteria);

    await this.executeQueryFind(context, update, criteria);
    this.extractIdsRowsFind(context, update, criteria);


    this.initQueryUpdate(context, update, criteria);
    this.setQueryUpdateFieldValues(context, update, criteria);
    this.setQueryUpdateWhere(context, update, criteria);
    this.stringifyQueryUpdate(context, update, criteria);

    await this.executeQueryUpdate(context, update, criteria);

    return context.idsToUpdate;
  }


  static initQueryFind(context, update, criteria) {
    context.queryFind = squel.select().from(this.TABLE);
  }

  static setQueryFindIdField(context, update, criteria) {
    logger.debug(this.name, '#update() ID_FIELD:', this.ID_FIELD);
    context.queryFind.field(this.TABLE + '.' + this.ID_FIELD, this.ID_FIELD);
  }

  static setQueryFindJoin(context, update, criteria) {
  }


  static setQueryFindWhere(context, update, criteria) {
    console.log(context.queryFind.field);
    Utils.setWhere(context.queryFind, this.FINDABLE_ALIASES, criteria);
  }

  static setQueryFindLimitAndOffset(context, update, criteria) {
    if(criteria.limit) context.queryFind.limit(criteria.limit);
    if(criteria.offset) context.queryFind.offset(criteria.offset);
  }

  static stringifyQueryFind(context, update, criteria) {
    context.queryFind = context.queryFind.toString();

    logger.debug(this.name, '#update() queryFind:', context.queryFind);
  }

  static async executeQueryFind(context, update, criteria) {
    context.rowsFind = await sqlite.all(context.queryFind);

    logger.debug(this.name, '#update() rowsFind:', context.rowsFind);
  }

  static extractIdsRowsFind(context, update, criteria) {
    context.idsToUpdate = [];
    _.each(context.rowsFind, function(row) {
      context.idsToUpdate.push(row[this.ID_FIELD]);
    }.bind(this));

    logger.debug(this.name, '#update() context.idsToUpdate:', context.idsToUpdate);
  }

  static initQueryUpdate(context, update, criteria) {
    context.queryUpdate = squel.update().table(this.TABLE);
  }

  static setQueryUpdateFieldValues(context, update, criteria) {
    context.queryUpdate.setFields(
      // only set fields which are updatable and drop everything else
      _.pick(update, this.UPDATABLE_ALIASES)
    );
  }

  static setQueryUpdateWhere(context, update, criteria) {
    context.queryUpdate
      .where(this.TABLE + '.' + this.ID_FIELD + ' IN ?', context.idsToUpdate);
  }

  static stringifyQueryUpdate(context, update, criteria) {
    context.queryUpdate = context.queryUpdate.toString();

    logger.debug(this.name, '#update() queryUpdate:', context.queryUpdate.toString());
  }

  static async executeQueryUpdate(context, update, criteria) {
    context.resultUpdate = await sqlite.get(context.queryUpdate);

    logger.debug(this.name, '#update() resultUpdate:', context.resultUpdate);
  }
}

GenericUpdate.TABLE;
GenericUpdate.ID_FIELD;
GenericUpdate.FINDABLE_ALIASES;
GenericUpdate.UPDATABLE_ALIASES;

module.exports = GenericUpdate;
