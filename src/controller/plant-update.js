'use strict';

const _ = require('lodash');

const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * PlantUpdate Class. Basically does the update() stuff for
 * Plants. See src/controller/generic-update for more detailed information
 * on how update works internally. If you want to know how to
 * use API, see src/models/plant #update().
 */
class PlantUpdate extends GenericUpdate {

  /**
   * We need to join some tables to make all FINDABLE_ALIASES of plant
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

PlantUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_PLANT;

PlantUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_PLANT;

PlantUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_PLANT;

// Remove some fields we don't want to be updatable
PlantUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_PLANT,
  CONSTANTS.ID_ALIAS_PLANT,
  CONSTANTS.MODIFIED_AT_ALIAS_PLANT,
  CONSTANTS.CREATED_AT_ALIAS_PLANT
);

// Add some fields we want to be updatable
PlantUpdate.UPDATABLE_ALIASES = _.concat(
  PlantUpdate.UPDATABLE_ALIASES,
  CONSTANTS.ID_ALIAS_GENOTYPE
)

module.exports = PlantUpdate;
