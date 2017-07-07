'use strict';

const _ = require('lodash');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');

const GenericFind = require('./generic-find');

/**
 * FamilyFind does all the functionality of Family.find
 * To manually execute a "FamilyFind-find", call FamilyFind.find().
 * To understand how finds work generally internally, See
 * src/controller/generic-find (we extend that class).
 * If you want to know how to use the Family.find() API, See
 * src/models/family #find().
 * <strong>Note:</strong> Do not use directly.
 * @private
 * @extends GenericFind
 */
class FamilyFind extends GenericFind {

  /**
   * We need to overwrite this method to, yeah,
   * build the returnObject. We basically iterate over
   * each row we get from database and add all family related
   * fields to returnObject.families.
   * @override
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
      // build families object
      returnObject.families =  {}
      _.each(context.rowsWhere, function(row) {
        Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria, true);
      });
  }
}

FamilyFind.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyFind.ATTR_ID = CONSTANTS.ATTR_ID_FAMILY;

FamilyFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_FAMILY;

FamilyFind.ALIASES_TO_FIELD_WITHOUT_ID = CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY;

module.exports = FamilyFind;
