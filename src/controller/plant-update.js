'use strict';

const _ = require('lodash');

const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * PlantUpdate Class. Basically does the update() stuff for
 * Plants. See GenericUpdate for more detailed information.
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
}

PlantUpdate.TABLE = CONSTANTS.TABLE_PLANTS;

PlantUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_PLANT;

PlantUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_PLANT;

PlantUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_PLANT;

PlantUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_PLANT,
  CONSTANTS.ID_ALIAS_PLANT,
  CONSTANTS.MODIFIED_AT_ALIAS_PLANT,
  CONSTANTS.CREATED_AT_ALIAS_PLANT
);

module.exports = PlantUpdate;
