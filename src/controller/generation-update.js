'use strict';

const _ = require('lodash');

const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * GenerationUpdate Class. Basically does the update() stuff for
 * Generations. See GenericUpdate for more detailed information.
 */
class GenerationUpdate extends GenericUpdate {
  /**
   * We need to join some tables to make all FINDABLE_ALIASES of generation
   * work.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static setQueryFindJoin(context, update, criteria) {
    QueryUtils.joinRelatedGenerations(context.queryFind);
  }

  static async executeQueryUpdate(context, update, criteria) {
    try {
      await super.executeQueryUpdate(context, update, criteria);
    } catch(err) {
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('update.familyId does not reference an existing Family');
      }
      throw err;
    }
  }
}

GenerationUpdate.TABLE = CONSTANTS.TABLE_GENERATIONS;

GenerationUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_GENERATION;

GenerationUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_GENERATION;

GenerationUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENERATION;

GenerationUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_GENERATION,
  CONSTANTS.ID_ALIAS_GENERATION,
  CONSTANTS.MODIFIED_AT_ALIAS_GENERATION,
  CONSTANTS.CREATED_AT_ALIAS_GENERATION
);

GenerationUpdate.UPDATABLE_ALIASES = _.concat(
  GenerationUpdate.UPDATABLE_ALIASES,
  CONSTANTS.ID_ALIAS_FAMILY
);

module.exports = GenerationUpdate;
