'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');

/**
 * This class creates a new Environment and gets internally called from
 * Environment.create(). If you want to know how Create works internally, see
 * src/controller/generic-create. If you want to know how to use the
 * Environment.create() API from outside, see src/models/Environment #create().
 * @private
 * @extends GenericCreate
 */
class EnvironmentCreate extends GenericCreate {
    /**
     * We need to validate the properties for new environment.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);
        Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);
        Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT);
    }
}

EnvironmentCreate.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentCreate.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_ENVIRONMENT;

EnvironmentCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ENVIRONMENT;

EnvironmentCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_ENVIRONMENT;

EnvironmentCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT]: ''
};

EnvironmentCreate.PLURAL = CONSTANTS.PLURAL_ENVIRONMENT;


module.exports = EnvironmentCreate;
