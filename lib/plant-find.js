'use strict';

const _ = require('lodash');

const logger = require('./logger');
const CONSTANTS = require('./constants');
const Utils = require('./utils');
const GenericFind = require('./generic-find');

class PlantFind extends GenericFind {
  static setQueryJoin(context, criteria) {
    Utils.leftJoinGenotypes(context.queryWhere);
    Utils.leftJoinGenerations(context.queryWhere);
    Utils.leftJoinFamilies(context.queryWhere);
  }

  static setQueryWhereDefaultFields(context, criteria) {
    context.queryWhere.fields(['plants.plantId', 'genotypes.genotypeId', 'generations.generationId', 'families.familyId']);
  }

  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(DISTINCT plants.plantId)', 'count');
  }

  static setQueryGroup(context, criteria) {
    context.queryWhere.group('plants.plantId');
  }

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
    Utils.deleteEmptyProperties(returnObject, ['families', 'generations', 'genotypes']);
  }
}

PlantFind.table = CONSTANTS.TABLE_PLANTS;
PlantFind.idField = CONSTANTS.ID_FIELD_PLANT;
PlantFind.allowedFields = _.concat(CONSTANTS.FIELDS_FAMILY, CONSTANTS.FIELDS_GENERATION, CONSTANTS.FIELDS_GENOTYPE, CONSTANTS.FIELDS_PLANT);
PlantFind.fieldAliases = _.merge({}, CONSTANTS.FIELD_ALIASES_FAMILY, CONSTANTS.FIELD_ALIASES_GENERATION, CONSTANTS.FIELD_ALIASES_GENOTYPE, CONSTANTS.FIELD_ALIASES_PLANT);

module.exports = PlantFind;
