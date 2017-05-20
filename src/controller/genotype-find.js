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

GenotypeFind.table = CONSTANTS.TABLE_GENOTYPES
GenotypeFind.idField = CONSTANTS.ID_FIELD_GENOTYPE;
GenotypeFind.allowedFields = CONSTANTS.ALLOWED_FIELDS_GENOTYPE;
GenotypeFind.fieldAliases = _.merge({}, CONSTANTS.FIELD_ALIASES_FAMILY, CONSTANTS.FIELD_ALIASES_GENERATION, CONSTANTS.FIELD_ALIASES_GENOTYPE);

module.exports = GenotypeFind;
