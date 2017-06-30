'use strict';

const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

const GenericCreate = require('./generic-create');

class FamilyCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeSet(options, 'familyName');
    Utils.hasToBeString(options, 'familyName');
  }

  static setQueryFields(context, options) {
    // Set fields
    context.query
      .set('familyId', null)
      .set('familyName', options.familyName);
  }

  static buildReturnObject(returnObject, context, options) {
    returnObject.families = {};
    returnObject.families[context.insertId] = {
      'familyId': context.insertId,
      'familyName': options.familyName,
      'familyCreatedAt': context.createdAt,
      'familyModifiedAt': context.modifiedAt,
    }
  }
}

FamilyCreate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyCreate.ALIAS_CREATED_AT = CONSTANTS.CREATED_AT_ALIAS_FAMILY;

FamilyCreate.ALIAS_MODIFIED_AT = CONSTANTS.MODIFIED_AT_ALIAS_FAMILY;

module.exports = FamilyCreate;
