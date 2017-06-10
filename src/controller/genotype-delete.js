'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const GenericDelete = require('./generic-delete');

class GenotypeDelete extends GenericDelete {

  static setQueryRelatedJoin(context, criteria) {
    Utils.leftJoinPlantsDownwards(context.queryRelated);
  }

  static setQueryRelatedFields(context, criteria) {
    context.queryRelated
      .field('genotypes.genotypeId')
      .field('plants.plantId');
  }

  static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
    context.genotypeIdsToDelete = new Set();
    context.plantIdsToDelete = new Set();

    _.each(context.rowsRelated, function(row) {
      //   now we iterate over each row and add all ids to the matching
      // context.xyzIdsToDelete. It's possible that we also add a null
      // field, but we will take care of that later
      context.genotypeIdsToDelete.add(row.genotypeId);
      context.plantIdsToDelete.add(row.plantId);
    });

    context.genotypeIdsToDelete = Utils.filterSetNotNull(context.genotypeIdsToDelete);
    context.plantIdsToDelete = Utils.filterSetNotNull(context.plantIdsToDelete);

    logger.debug(this.name, '#delete() genotypeIdsToDelete:', context.genotypeIdsToDelete);
    logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
  }

  static setQueryDeleteWhere(context, criteria) {
    context.queryDelete
      .where('genotypes.genotypeId IN ?', context.genotypeIdsToDelete);
  }

  static buildReturnObject(returnObject, context, criteria) {
    returnObject['genotypes'] = context.genotypeIdsToDelete;
    returnObject['plants'] = context.plantIdsToDelete;
  }
}

GenotypeDelete.TABLE = CONSTANTS.TABLE_GENOTYPES;
GenotypeDelete.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENOTYPE;

module.exports = GenotypeDelete;

console.log(CONSTANTS.ALIASES_ALL_GENOTYPE);
