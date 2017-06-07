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

FamilyFind.TABLE = CONSTANTS.TABLE_FAMILIES;
FamilyFind.ID_ALIAS = CONSTANTS.ID_ALIAS_FAMILY;
FamilyFind.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_FAMILY;
FamilyFind.ALIASES_TO_FIELD_WITHOUT_ID = CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY;

module.exports = FamilyFind;
