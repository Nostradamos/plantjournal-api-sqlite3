'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');

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
  static validate(self, context) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(context.creatingClassName !== this.name) {
      if(_.has(options, CONSTANTS.ATTR_ID_FAMILY)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_FAMILY);
        return true;
      }

      if(!options[CONSTANTS.ATTR_NAME_FAMILY]) {
        throw new Error(`options.familyId is not set. Missing familyId or attributes to create a new family.`);
      }
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_FAMILY);
    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_FAMILY);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_FAMILY);
  }
}

FamilyCreate.TABLE = CONSTANTS.TABLE_FAMILY;

FamilyCreate.ATTR_ID = CONSTANTS.ATTR_ID_FAMILY;

FamilyCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_FAMILY;

FamilyCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_FAMILY;

FamilyCreate.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_GENERATIONS_FAMILY;

FamilyCreate.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_GENERATION;

FamilyCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_FAMILY;

FamilyCreate.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_FAMILY]: '',
  [CONSTANTS.ATTR_GENERATIONS_FAMILY]: []
};

FamilyCreate.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_GENERATIONS_FAMILY
];

FamilyCreate.PLURAL = CONSTANTS.PLURAL_FAMILY;

module.exports = FamilyCreate;
