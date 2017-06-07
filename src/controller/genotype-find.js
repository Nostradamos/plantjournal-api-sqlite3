'use strict';

const _ = require('lodash');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');
const GenericFind = require('./generic-find');

class GenotypeFind extends GenericFind {
  static setQueryJoin(context, criteria) {
    Utils.leftJoinGenerations(context.queryWhere);
    Utils.leftJoinFamilies(context.queryWhere);
  }

  static setQueryWhereDefaultFields(context, criteria) {
    context.queryWhere.fields(['genotypes.genotypeId', 'generations.generationId', 'families.familyId']);
  }

  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(DISTINCT genotypes.genotypeId)', 'count');
  }

  static setQueryGroup(context, criteria) {
    context.queryWhere.group('genotypes.genotypeId');
  }

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
GenotypeFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge({}, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE);

module.exports = GenotypeFind;
