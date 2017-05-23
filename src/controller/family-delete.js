'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');
const GenericDelete = require('./generic-delete');

class FamilyDelete extends GenericDelete {
  static setQueryWhereIdField(context, criteria) {
    context.queryWhere.field('families.familyId');
  }

  static extractIdsToDelete(context, criteria) {
    context.familyIdsToDelete = [];

    _.each(context.rowsWhere, function(row) {
      context.familyIdsToDelete.push(row.familyId);
    });

    logger.debug(this.name, '#delete() familyIdsToDelete:', context.familyIdsToDelete);
  }

  static setQueryDeleteWhere(context, criteria) {
    context.queryDelete
      .where('families.familyId IN ?', context.familyIdsToDelete);
  }

  static buildReturnObject(returnObject, context, criteria) {
    returnObject['familyId'] = context.familyIdsToDelete;
  }
}

FamilyDelete.table = CONSTANTS.TABLE_FAMILIES;
FamilyDelete.allowedFields = CONSTANTS.ALLOWED_FIELDS_FAMILY;

module.exports = FamilyDelete;
