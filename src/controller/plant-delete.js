'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const GenericDelete = require('./generic-delete');

class PlantDelete extends GenericDelete {

  static setQueryRelatedFields(context, criteria) {
    context.queryRelated
      .field('plants.plantId');
  }

  static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
    context.plantIdsToDelete = new Set();

    _.each(context.rowsRelated, function(row) {
      //   now we iterate over each row and add all ids to the matching
      // context.xyzIdsToDelete. It's possible that we also add a null
      // field, but we will take care of that later
      context.plantIdsToDelete.add(row.plantId);
    });

    context.plantIdsToDelete = Utils.filterSetNotNull(context.plantIdsToDelete);

    logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
  }

  static setQueryDeleteWhere(context, criteria) {
    context.queryDelete
      .where('plants.plantId IN ?', context.plantIdsToDelete);
  }

  static buildReturnObject(returnObject, context, criteria) {
    returnObject['plants'] = context.plantIdsToDelete;
  }
}

PlantDelete.TABLE = CONSTANTS.TABLE_PLANTS;
PlantDelete.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_PLANT;

module.exports = PlantDelete;
