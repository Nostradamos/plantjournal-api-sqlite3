'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

class MediumCreate extends GenericCreate {
    /**
     * We need to validate the properties for new Medium.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_MEDIUM);
        Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_MEDIUM);
        Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_MEDIUM);
        Utils.hasToBeIntOrNull(options, CONSTANTS.ATTR_ID_ENVIRONMENT);
    }


    /**
     * We need to catch foreig key constraing failed error to throw our
     * own error.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Will throw error if options.familyId does not reference an
     *         existing family.
     */
    static async executeQuery(context, options) {
        try {
            await super.executeQuery(context, options);
        } catch(err) {
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.environmentId does not reference an existing environment');
            }
            throw err;
        }
    }
}

MediumCreate.TABLE = CONSTANTS.TABLE_MEDIUM;

MediumCreate.ATTR_ID = CONSTANTS.ATTR_ID_MEDIUM;

MediumCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_MEDIUM;

MediumCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_MEDIUM;

MediumCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_MEDIUM;

MediumCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_MEDIUM]: ''
};

MediumCreate.PLURAL = CONSTANTS.PLURAL_MEDIUM;


module.exports = MediumCreate;
