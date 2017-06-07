'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const GenericDelete = require('./generic-delete');

class GenerationDelete extends GenericDelete {

  static setQueryRelatedJoin(context, criteria) {
    Utils.leftJoinGenotypesDownwards(context.queryRelated);
    Utils.leftJoinPlantsDownwards(context.queryRelated);
  }

  static setQueryRelatedFields(context, criteria) {
    context.queryRelated
      .field('generations.generationId')
      .field('genotypes.genotypeId')
      .field('plants.plantId');
  }

  static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
    context.generationIdsToDelete = new Set();
    context.genotypeIdsToDelete = new Set();
    context.plantIdsToDelete = new Set();

    _.each(context.rowsRelated, function(row) {
      // now we iterate over each row and add all ids to the matching
      // context.xyzIdsToDelete. It's possible that we also add a null
      // field, but we will take care of that later
      context.generationIdsToDelete.add(row.generationId);
      context.genotypeIdsToDelete.add(row.genotypeId);
      context.plantIdsToDelete.add(row.plantId);
    });

    context.generationIdsToDelete = Utils.filterSetNotNull(context.generationIdsToDelete);
    context.genotypeIdsToDelete = Utils.filterSetNotNull(context.genotypeIdsToDelete);
    context.plantIdsToDelete = Utils.filterSetNotNull(context.plantIdsToDelete);

    logger.debug(this.name, '#delete() generationIdsToDelete:', context.generationIdsToDelete);
    logger.debug(this.name, '#delete() genotypeIdsToDelete:', context.genotypeIdsToDelete);
    logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
  }

  static setQueryDeleteWhere(context, criteria) {
    context.queryDelete
      .where('generations.generationId IN ?', context.generationIdsToDelete);
  }

  static buildReturnObject(returnObject, context, criteria) {
    returnObject['generations'] = context.generationIdsToDelete;
    returnObject['genotypes'] = context.genotypeIdsToDelete;
    returnObject['plants'] = context.plantIdsToDelete;
  }
}

GenerationDelete.TABLE = CONSTANTS.TABLE_FAMILIES;
GenerationDelete.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_ALL_GENERATION;

module.exports = GenerationDelete;
