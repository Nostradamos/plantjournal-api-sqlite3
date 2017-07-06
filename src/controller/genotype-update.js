'use strict';

const _ = require('lodash');

const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * GenotypeUpdate Class. Basically does the update() stuff for
 * Genotypes. See GenericUpdate for more detailed information
 * on internal update process. For API usage see
 * src/model/Genotype #update().
 * @private
 * @extends GenericUpdate
 */
class GenotypeUpdate extends GenericUpdate {

  /**
   * We need to join some tables to make all FINDABLE_ALIASES of genotype
   * work.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static setQueryFindJoin(context, update, criteria) {
    QueryUtils.joinRelatedGenotypes(context.queryFind);
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
        throw new Error('update.generationId does not reference an existing Generation');
      }
      throw err;
    }
  }
}

GenotypeUpdate.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_GENOTYPE;

GenotypeUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE;

GenotypeUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENOTYPE;

// Remove some fields we don't want to be updatable
GenotypeUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_GENOTYPE,
  CONSTANTS.ID_ALIAS_GENOTYPE,
  CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE,
  CONSTANTS.CREATED_AT_ALIAS_GENOTYPE
);

// Add some fields we want to be updatable
GenotypeUpdate.UPDATABLE_ALIASES = _.concat(
  GenotypeUpdate.UPDATABLE_ALIASES,
  CONSTANTS.ID_ALIAS_GENERATION
)

module.exports = GenotypeUpdate;
