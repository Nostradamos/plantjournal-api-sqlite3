'use strict';

const _ = require('lodash');

const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * GenotypeUpdate Class. Basically does the update() stuff for
 * Genotypes. See GenericUpdate for more detailed information.
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
}

GenotypeUpdate.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_GENOTYPE;

GenotypeUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE;

GenotypeUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENOTYPE;

GenotypeUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_GENOTYPE,
  CONSTANTS.ID_ALIAS_GENOTYPE,
  CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE,
  CONSTANTS.CREATED_AT_ALIAS_GENOTYPE
);

module.exports = GenotypeUpdate;
