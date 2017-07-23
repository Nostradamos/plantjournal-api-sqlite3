'use strict';

const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * PlantUpdate Class. Basically does the update() stuff for
 * Plants. See src/controller/generic-update for more detailed information
 * on how update works internally. If you want to know how to
 * use API, see src/models/plant #update().
 * @private
 * @extends GenericUpdate
 */
class PlantUpdate extends GenericUpdate {

    /**
   * We need to join some tables to make all ATTRIBUTES_SEARCHABLE of plant
   * work.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryFindJoin(context, update, criteria) {
        QueryUtils.joinRelatedPlants(context.queryFind);
    }

    /**
   * We need to catch sqlite constraint error and throw our
   * own error for this.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static async executeQueryUpdate(context, update, criteria) {
        try {
            await super.executeQueryUpdate(context, update, criteria);
        } catch(err) {
            if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('update.genotypeId or update.plantClonedFrom does not reference an existing genotype/plant');
            }
            throw err;
        }
    }

}

PlantUpdate.TABLE = CONSTANTS.TABLE_PLANTS;

PlantUpdate.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT;

PlantUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_PLANT;

// Remove some fields we don't want to be updatable
PlantUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_PLANT;

module.exports = PlantUpdate;
