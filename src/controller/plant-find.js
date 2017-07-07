'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const GenericFind = require('./generic-find');

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
   * We need to join genotypes, generations and families to make it possible to
   * find plants based on familyName, familyId, generationName,
   * generationParents, genotypeName etc. This basically enforces us to query
   * every field of genotypes, generations and families.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereJoin(context, criteria) {
    QueryUtils.joinRelatedPlants(context.queryWhere);
  }

  /**
   * Build the returnObject. We want to have all plant fields (like plantName,
   * plantSex...) in returnObject.plants, all genotype fields (like
   * genotypeName etc) in returnObject.genotypes, all family fields
   * (like familyName, familyId) inreturnObject.families and all
   * generation fields in returnObject.generations.
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
    _.each(context.rowsWhere, function(row) {
      Utils.addPlantFromRowToReturnObject(row, returnObject, criteria, true);
      Utils.addGenotypeFromRowToReturnObject(row, returnObject, criteria);
      Utils.addGenerationFromRowToReturnObject(row, returnObject, criteria);
      Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria);
    });

    Utils.deleteEmptyProperties(
      returnObject, ['families', 'generations', 'genotypes']
    );
  }
}

PlantFind.TABLE = CONSTANTS.TABLE_PLANTS;

PlantFind.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_PLANT;

PlantFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge(
  {},
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_PLANT
);

PlantFind.DEFAULT_FIELDS = ['plants.plantId', 'genotypes.genotypeId', 'generations.generationId',
 'families.familyId'];

PlantFind.COUNT = 'DISTINCT plants.plantId';

PlantFind.GROUP_BY = 'plants.plantId';

module.exports = PlantFind;
