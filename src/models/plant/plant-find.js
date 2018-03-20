'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsQuery = require('../../utils/utils-query');
const UtilsReturnObject = require('../../utils/utils-return-object');

const GenericFind = require('../generic/generic-find');

/**
 * PlantFind does all the functionality of Plant.find
 * To manually execute a "PlantFind-find", call PlantFind.find().
 * To understand how finds work generally internally, See
 * src/controller/generic-find (we extend that class).
 * If you want to know how to use the Plant.find() API, See
 * src/models/plant #find().
 * @private
 * @extends GenericFind
 */
class PlantFind extends GenericFind {

  /**
   * We need to join genotypes, generations and families to make it possible
   * to find plants based on familyName, familyId, generationName,
   * generationParents, genotypeName etc. This basically enforces us to query
   * every field of genotypes, generations and families.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereJoin(context, criteria) {
    UtilsQuery.joinRelatedPlants(context.queryWhere);
  }

  /**
   * Build the returnObject. We want to have all plant attributes
   * (like plantName, plantSex...) in returnObject.plants, all genotype
   * attributes (like genotypeName etc) in returnObject.genotypes, all family
   * attributes (like familyName, familyId) inreturnObject.families and all
   * generation attributes in returnObject.generations.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
    returnObject.plants = {};
    returnObject.genotypes = {};
    returnObject.generations = {};
    returnObject.families = {};
    returnObject.mediums = {};
    returnObject.environments = {};

    for(let row of context.rowsWhere) {
      UtilsReturnObject.addPlant(row, returnObject, true);
      UtilsReturnObject.addGenotype(row, returnObject);
      UtilsReturnObject.addGeneration(row, returnObject);
      UtilsReturnObject.addFamily(row, returnObject);
      UtilsReturnObject.addMedium(row, returnObject);
      UtilsReturnObject.addEnvironment(row, returnObject);
    }

    Utils.deleteEmptyProperties(
      returnObject, ['families',
        'generations',
        'genotypes']
    );
  }
}

PlantFind.TABLE = CONSTANTS.TABLE_PLANT;

PlantFind.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_PLANT;

let explicitPlantId = Utils.explicitColumn(
  CONSTANTS.TABLE_PLANT, CONSTANTS.ATTR_ID_PLANT);

PlantFind.DEFAULT_FIELDS = [
  explicitPlantId,
  Utils.explicitColumn(CONSTANTS.TABLE_GENOTYPE, CONSTANTS.ATTR_ID_GENOTYPE),
  Utils.explicitColumn(
    CONSTANTS.TABLE_GENERATION, CONSTANTS.ATTR_ID_GENERATION),
  Utils.explicitColumn(CONSTANTS.TABLE_FAMILY, CONSTANTS.ATTR_ID_FAMILY),
  Utils.explicitColumn(CONSTANTS.TABLE_MEDIUM, CONSTANTS.ATTR_ID_MEDIUM)
];

PlantFind.COUNT = 'DISTINCT ' + explicitPlantId;

PlantFind.GROUP_BY = explicitPlantId;

module.exports = PlantFind;
