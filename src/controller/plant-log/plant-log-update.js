'use strict';

const CONSTANTS = require('../../constants');

const GenericUpdate = require('../generic/generic-update');

class PlantLogUpdate extends GenericUpdate {
    /**
     * We need to wrap around super.executeQueryUpdate() to catch SQLITE_CONSTRAINT
     * error and throw a custom error.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     * @return {Promise}
     */
    static async executeQueryUpdate(context, update, criteria) {
        try {
            await super.executeQueryUpdate(context, update, criteria);
        } catch (err) {
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('update.' + CONSTANTS.ATTR_ID_PLANT + ' does not reference an existing plant');
            }
            throw err;
        }
    }
}

PlantLogUpdate.TABLE = CONSTANTS.TABLE_PLANT_LOG; // Table name

PlantLogUpdate.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG; // name of id field

PlantLogUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT_LOG; // name of modifiedAt Field

PlantLogUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.ALL_ATTRIBUTES_PLANT_LOG; // array of aliases which we can search through

PlantLogUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_PLANT_LOG; // array of aliases which we can update, everything else will be ignored

PlantLogUpdate.OVERWRITE_TABLE_LOOKUP = {
    [CONSTANTS.ATTR_ID_PLANT]: CONSTANTS.TABLE_PLANT_LOG
};


module.exports = PlantLogUpdate;
