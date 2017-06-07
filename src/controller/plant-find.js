'use strict';

const _ = require('lodash');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');
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

PlantFind.TABLE = CONSTANTS.TABLE_PLANTS;
PlantFind.ID_ALIAS = CONSTANTS.ID_ALIAS_PLANT;
PlantFind.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_PLANT;
PlantFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge({}, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_PLANT);

module.exports = PlantFind;
