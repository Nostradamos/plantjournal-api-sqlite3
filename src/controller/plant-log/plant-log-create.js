'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

class PlantLogCreate extends GenericCreate {

    /**
     * We need to validate input and throw errors if we're unhappy with it.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, CONSTANTS.ATTR_TIMESTAMP_PLANT_LOG);
        Utils.hasToBeSet(options, CONSTANTS.ATTR_TYPE_PLANT_LOG);
        Utils.hasToBeSet(options, CONSTANTS.ATTR_VALUE_PLANT_LOG);
        Utils.hasToBeSet(options, CONSTANTS.ATTR_ID_PLANT);

        Utils.hasToBeString(options, CONSTANTS.ATTR_TYPE_PLANT_LOG);
    }

    /**
     * We need to catch SQLITE_CONSTRAINT error and throw custom error
     * message if this happens.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     * @return {Promise}
     */
    static async executeQuery(context, options) {
        try {
            await super.executeQuery(context, options);
        } catch (err) {
            // We only have one foreign key so we can safely assume, if a foreign key constraint
            // fails, it's the generationId constraint.
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.plantId does not reference an existing Plant');
            }
            throw err;
        }
    }

}

PlantLogCreate.TABLE = CONSTANTS.TABLE_PLANT_LOGS;

PlantLogCreate.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG;

PlantLogCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_PLANT_LOG;

PlantLogCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT_LOG;

PlantLogCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_PLANT_LOG;

PlantLogCreate.PLURAL = CONSTANTS.PLURAL_PLANT_LOG;

module.exports = PlantLogCreate;
