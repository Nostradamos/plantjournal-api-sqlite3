'use strict';

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils/utils');

const GenericDelete = require('../generic/generic-delete');

/**
 * This class extends {@link GenericDelete} to fit the needs for Plant
 * deletions. The delete() method gets called internally from Plant.delete().
 * If you want to know how delete works internally, see
 * {@link GenericAdd|src/controller/generic-add}.
 * If you want to know how to use the Plant.delete()
 * API from outside, see {@link Plant|src/models/Plant #create()}.
 * @private
 * @extends GenericDelete
 */
class PlantDelete extends GenericDelete {

  /**
   * We need to select plantId.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
  static setQueryRelatedFields(context, criteria) {
    context.queryRelated
      .field(Utils.explicitColumn(
        CONSTANTS.TABLE_PLANT, CONSTANTS.ATTR_ID_PLANT));
  }

  /**
   * Get all plantIds from rowsRelated.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
  static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
    context.plantIdsToDelete = new Set();

    for(let row of context.rowsRelated) {
      //   now we iterate over each row and add all ids to the matching
      // context.xyzIdsToDelete. It's possible that we also add a null
      // field, but we will take care of that later
      context.plantIdsToDelete.add(row.plantId);
    }

    context.plantIdsToDelete = Utils.whereSetNotNull(
      context.plantIdsToDelete);

    context.haveIdsToDelete = context.plantIdsToDelete.length > 0;

    logger.debug(
      `${this.name} #delete() plantIdsToDelete:`, context.plantIdsToDelete);
  }

  /**
   * Set which plants should get deleted.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
  static setQueryDeleteWhere(context, criteria) {
    let attr = Utils.explicitColumn(
      CONSTANTS.TABLE_PLANT, CONSTANTS.ATTR_ID_PLANT);
    context.queryDelete
      .where(`${attr} IN ?`, context.plantIdsToDelete);
  }

  /**
   * Apply deleted plantIds to returnObject['plants'].
   * @param  {object} returnObject
   *         returnObject, an empty assoc array which will get returned at the
   *         end of #delete()
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
  static buildReturnObject(returnObject, context, criteria) {
    returnObject['plants'] = context.plantIdsToDelete;
  }
}

PlantDelete.TABLE = CONSTANTS.TABLE_PLANT;
PlantDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_PLANT;

module.exports = PlantDelete;
