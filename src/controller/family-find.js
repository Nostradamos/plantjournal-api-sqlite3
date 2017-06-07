'use strict';

const _ = require('lodash');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');
const GenericFind = require('./generic-find');

class FamilyFind extends GenericFind {
  static buildReturnObjectWhere(returnObject, context, criteria) {
      // build families object
      returnObject.families =  {}
      _.each(context.rowsWhere, function(row) {
        Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria, true);
      });
  }
}

FamilyFind.table = CONSTANTS.TABLE_FAMILIES;
FamilyFind.idField = CONSTANTS.ID_ALIAS_FAMILY;
FamilyFind.allowedFields = CONSTANTS.ALIASES_ALL_FAMILY;
FamilyFind.fieldAliases = CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY;

module.exports = FamilyFind;
