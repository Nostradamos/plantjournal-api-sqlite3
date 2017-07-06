'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

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
  static setQueryJoin(context, criteria) {
    Utils.leftJoinGenerations(context.queryWhere);
    Utils.leftJoinFamilies(context.queryWhere);
  }

  /**
   * We want to have to genotypeId, generationId and familyId always selected
   * (even if you dont have if in your fields array in criteria).
   * This may change in future.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereDefaultFields(context, criteria) {
    context.queryWhere.fields(
      ['genotypes.genotypeId', 'generations.generationId', 'families.familyId']
    );
  }

  /**
   * We only want to count unique genotypeIds. It's possible that we get
   * multiple rows with the same genotypeId (eg: because of generation_parents).
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(DISTINCT genotypes.genotypeId)', 'count');
  }

  /**
   * Group by genotypeId.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryGroup(context, criteria) {
    context.queryWhere.group('genotypes.genotypeId');
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

module.exports = GenotypeFind;
