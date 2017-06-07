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

GenerationFind.TABLE = CONSTANTS.TABLE_GENERATIONS
GenerationFind.ID_ALIAS = CONSTANTS.ID_ALIAS_GENERATION;
GenerationFind.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENERATION;
GenerationFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge({}, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY, CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION);

module.exports = GenerationFind;
