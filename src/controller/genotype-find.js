'use strict';

const _ = require('lodash');
const util = require('util');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const GenericFind = require('./generic-find');

/**
* GenotypeFind does all the functionality of Genotype.find
* To manually execute a "GenotypeFind-find", call GenotypeFind.find().
* To understand how finds work generally internally, See
* src/controller/generic-find (we extend that class).
* If you want to know how to use the Genotype.find() API, See
* src/models/genotype #find().
* @private
* @extends GenericFind
 */
class GenotypeFind extends GenericFind {

  /**
   * We need to join both generation and families to make it possible to find
   * genotypes based on familyName, familyId, generationName etc. This basically
   * enforces us to query every field of generations or families.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereJoin(context, criteria) {
    QueryUtils.leftJoinGenerations(context.queryWhere);
    QueryUtils.leftJoinFamilies(context.queryWhere);
  }

  /**
   * Build the returnObject. We want to have all genotype fields (like
   * genotypeName etc) in returnObject.genotypes, all family fields
   * (like familyName, familyId) inreturnObject.families and all
   * generation fields in returnObject.generations.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
    returnObject.genotypes = {};
    returnObject.generations = {};
    returnObject.families = {};
    _.each(context.rowsWhere, function(row) {
      Utils.addGenotypeFromRowToReturnObject(row, returnObject, criteria, true);
      Utils.addGenerationFromRowToReturnObject(row, returnObject, criteria);
      Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria);
    });
    Utils.deleteEmptyProperties(returnObject, ['families', 'generations']);
  }
}

GenotypeFind.TABLE = CONSTANTS.TABLE_GENOTYPES

GenotypeFind.ID_ALIAS = CONSTANTS.ID_ALIAS_GENOTYPE;

GenotypeFind.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENOTYPE;

GenotypeFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge(
  {},
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE
);

GenotypeFind.DEFAULT_FIELDS = ['genotypes.genotypeId', 'generations.generationId', 'families.familyId'];

GenotypeFind.COUNT = 'DISTINCT ' + CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ID_ALIAS_GENERATION;

GenotypeFind.GROUP_BY = CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ID_ALIAS_GENERATION;

module.exports = GenotypeFind;
