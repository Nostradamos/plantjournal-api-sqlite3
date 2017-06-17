'use strict';

const _ = require('lodash');

const Utils = require('../utils');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * FamilyUpdate Skeleton. See GenericUpdate for more information.
 */
class FamilyUpdate extends GenericUpdate {
  /**
   * We have to join some tables to make it possible to query all related fields
   * of family with criteria.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static setQueryFindJoin(context, update, criteria) {
    Utils.leftJoinGenerationsDownwards(context.queryFind);
    Utils.leftJoinGenotypesDownwards(context.queryFind);
    Utils.leftJoinPlantsDownwards(context.queryFind);
  }
}

FamilyUpdate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_FAMILY;

// We can search through all fields related to family
FamilyUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_PLANT;

// We don't want the id field to be updatable, so remove it
FamilyUpdate.UPDATABLE_ALIASES = _.without(CONSTANTS.ALIASES_ONLY_FAMILY, CONSTANTS.ID_ALIAS_FAMILY);

module.exports = FamilyUpdate;
