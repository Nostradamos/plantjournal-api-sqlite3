'use strict';

const _ = require('lodash');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils');
const GenericFind = require('./generic-find');

class GenerationFind extends GenericFind {
  static setQueryJoin(context, criteria) {
    // We can't use Utils.leftJoinGenerations because we only want to join
    // generation_parents
    context.queryWhere.left_join(
      CONSTANTS.TABLE_GENERATION_PARENTS,
      'generation_parents',
      'generations.generationId = generation_parents.generationId'
    );
    Utils.leftJoinFamilies(context.queryWhere);
  }

  static setQueryWhereDefaultFields(context, criteria) {
    context.queryWhere.fields(['generations.generationId', 'families.familyId']);
  }

  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(DISTINCT generations.generationId)', 'count');
  }

  static setQueryGroup(context, criteria) {
    context.queryWhere.group('generations.generationId');
  }

  static buildReturnObjectWhere(returnObject, context, criteria) {
    returnObject.families = {};
    returnObject.generations = {};

    _.each(context.rowsWhere, function(row) {
      Utils.addGenerationFromRowToReturnObject(row, returnObject, criteria, true);
      Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria);
    });

    // We could use Utils.deleteEmptyProperties() but this is maybe more performant.
    if(_.isEmpty(returnObject.families)) delete returnObject.families;
  }
}

GenerationFind.table = CONSTANTS.TABLE_GENERATIONS
GenerationFind.idField = CONSTANTS.ID_FIELD_GENERATION;
GenerationFind.allowedFields = CONSTANTS.ALLOWED_FIELDS_GENERATION;
GenerationFind.fieldAliases = _.merge({}, CONSTANTS.FIELD_ALIASES_FAMILY, CONSTANTS.FIELD_ALIASES_GENERATION);

module.exports = GenerationFind;
