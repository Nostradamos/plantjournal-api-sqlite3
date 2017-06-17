'use strict';

const Utils = require('../utils');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

class GenerationUpdate extends GenericUpdate {
  static setQueryFindJoin(context, update, criteria) {
    Utils.leftJoinGenotypesDownwards(context.queryFind);
    Utils.leftJoinPlantsDownwards(context.queryFind);
  }
}

GenerationUpdate.TABLE = CONSTANTS.TABLE_GENERATIONS;
GenerationUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_GENERATION;
GenerationUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENERATION;
GenerationUpdate.UPDATABLE_ALIASES = _.without(CONSTANTS.ALIASES_ONLY_GENERATION, CONSTANTS.ID_ALIAS_GENERATION);

module.exports = GenerationUpdate;
