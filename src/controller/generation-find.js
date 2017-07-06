'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

const GenericFind = require('./generic-find');

/**
* GenerationFind does all the functionality of Generation.find
* To manually execute a "GenerationFind-find", call GenerationFind.find().
* To understand how finds work generally internally, See
* src/controller/generic-find (we extend that class).
* If you want to know how to use the Generation.find() API, See
* src/models/generation #find().
* @private
* @extends GenericFind
 */
class GenerationFind extends GenericFind {
  /**
   * We need to join families table, so that we can for example also find
   * generations based on their family name.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
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

  /**
   * We want to have to generationId and familyId always selected (even if you
   * dont have if in your fields array in criteria). This may change in future.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereDefaultFields(context, criteria) {
    context.queryWhere.fields(['generations.generationId', 'families.familyId']);
  }

  /**
   * We only want to count unique generationIds. It's possible that we get
   * multiple rows with the same genotypeId (eg: because of generation_parents).
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(DISTINCT generations.generationId)', 'count');
  }

  /**
   * Group by generationId.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryGroup(context, criteria) {
    context.queryWhere.group('generations.generationId');
  }

  /**
   * Build the returnObject. We want to have all family fields
   * (like familyName, familyId) inreturnObject.families and all
   * generation fields in returnObject.generations.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
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

GenerationFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge(
  {},
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION
);

module.exports = GenerationFind;
