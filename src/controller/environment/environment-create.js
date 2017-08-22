'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

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

EnvironmentCreate.TABLE = CONSTANTS.TABLE_ENVIRONMENTS;

EnvironmentCreate.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_ENVIRONMENT;

EnvironmentCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ENVIRONMENT;

EnvironmentCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_ENVIRONMENT;

EnvironmentCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT]: ''
};

EnvironmentCreate.PLURAL = CONSTANTS.PLURAL_ENVIRONMENT;


module.exports = EnvironmentCreate;
