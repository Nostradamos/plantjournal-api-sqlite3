'use strict';

const CONSTANTS = require('./constants');
const GenericCreate = require('./generic-create');
const logger = require('./logger');
const squel = require('squel');
const Utils = require('./utils');


class FamilyCreate extends GenericCreate {
  static buildQuery(context, options) {
    // Set fields
    context.query
      .set('familyId', null)
      .set('familyName', options.familyName);
  }

  static validate(context, options) {
    Utils.hasToBeSet(options, 'familyName');
    Utils.hasToBeString(options, 'familyName');
  }

  static buildReturnObject(returnObject, context, options) {
    console.log(options);
    returnObject.families = {};
    returnObject.families[context.insertId] = {
      'familyId': context.insertId,
      'familyName': options.familyName
    }
  }
}

FamilyCreate.prototype.name = "Family";
FamilyCreate.table = CONSTANTS.TABLE_FAMILIES;

module.exports = FamilyCreate;
