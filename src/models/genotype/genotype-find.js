'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsQuery = require('../../utils/utils-query');
const UtilsReturnObject = require('../../utils/utils-return-object');


const GenericFind = require('../generic/generic-find');

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
   * genotypes based on familyName, familyId, generationName etc. This
   * basically enforces us to query every field of generations or families.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereJoin(context, criteria) {
    UtilsQuery.joinRelatedGenotypes(context.queryWhere);
  }

  /**
   * Build the returnObject. We want to have all genotype attributes (like
   * genotypeName etc) in returnObject.genotypes, all family attributes
   * (like familyName, familyId) inreturnObject.families and all
   * generation attributes in returnObject.generations.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
    returnObject.genotypes = {};
    returnObject.generations = {};
    returnObject.families = {};

    for(let row of context.rowsWhere) {
      UtilsReturnObject.addGenotype(row, returnObject, true);
      UtilsReturnObject.addGeneration(row, returnObject);
      UtilsReturnObject.addFamily(row, returnObject);
    }

    Utils.deleteEmptyProperties(returnObject, ['families', 'generations']);
  }
}

GenotypeFind.TABLE = CONSTANTS.TABLE_GENOTYPE;

GenotypeFind.ATTR_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenotypeFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE;

GenotypeFind.DEFAULT_FIELDS = ['genotypes.genotypeId',
  'generations.generationId',
  'families.familyId'];

GenotypeFind.COUNT = 'DISTINCT ' +
  Utils.explicitColumn(CONSTANTS.TABLE_GENOTYPE, CONSTANTS.ATTR_ID_GENOTYPE);

module.exports = GenotypeFind;
