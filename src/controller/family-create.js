'use strict';

const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

const GenericCreate = require('./generic-create');

/**
 * FamilyCreate Class. Creates a new Family and gets
 * internally called from Family.create(). If you want
 * to know how Create works internally, see
 * src/controller/generic-create.
 * If you want to know how to use the Family.create()
 * API from outside, see src/models/Family #create().
 * @private
 * @extends GenericCreate
 */
class FamilyCreate extends GenericCreate {

  /**
   * We need to validate the options.familyName property and throw
   * Error if we don't accept the input.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   */
  static validate(context, options) {
    Utils.hasToBeSet(options, 'familyName');
    Utils.hasToBeString(options, 'familyName');
    Utils.hasToBeString(options, 'familyDescription');
  }

  /**
   * This method will set all INSERT fields for context.query.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static setQueryFields(context, options) {
    // Set fields
    context.query
      .set('familyId', null)
      .set('familyName', options.familyName)
      .set('familyDescription', options.familyDescription);
  }

  /**
   * Finally build returnObject, just set all the info
   * about the created Family into one object which
   * will get returned.
   * @param  {object} returnObject
   *         object which will find returned from #create()
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static buildReturnObject(returnObject, context, options) {
    returnObject.families = {};
    returnObject.families[context.insertId] = {
      'familyId': context.insertId,
      'familyName': options.familyName,
      'familyDescription': options.familyDescription || '',
      'familyCreatedAt': context.createdAt,
      'familyModifiedAt': context.modifiedAt,
    }
  }
}

FamilyCreate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyCreate.ALIAS_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_FAMILY;

FamilyCreate.ALIAS_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_FAMILY;

module.exports = FamilyCreate;
