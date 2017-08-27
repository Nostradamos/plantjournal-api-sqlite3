'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

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
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_FAMILY);
        Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_FAMILY);
        Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_FAMILY);
    }
}

FamilyCreate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyCreate.ATTR_ID = CONSTANTS.ATTR_ID_FAMILY;

FamilyCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_FAMILY;

FamilyCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_FAMILY;

FamilyCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_FAMILY;

FamilyCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_FAMILY]: ''
};

FamilyCreate.PLURAL = CONSTANTS.PLURAL_FAMILY;

module.exports = FamilyCreate;
