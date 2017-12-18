'use strict';

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsQuery = require('../../utils/utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * FamilyDelete class which gets executed from Family.delete().
 * If you want to know how delete works internally,
 * see src/controller/generic-delete. If you want to know how to use the
 * Family.delete() API, see src/models/family #delete.
 * If you want to execute FamilyDelete manually, just call
 * FamilyDelete.delete().
 * @private
 * @extends GenericDelete
 */
class FamilyDelete extends GenericDelete {

  /**
     * Because we don't only delete families, but also referenced generations,
     * genotypes and plants, we want to know all them. SQLITE will make sure
     * that they will get deleted, but without us knowing that. So get them.
     * We need this information for the later return object (and in future
     * for onDelete events.).
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
  static setQueryRelatedJoin(context, criteria) {
    UtilsQuery.joinGenerationsAndGenerationParentsFromFamilies(
      context.queryRelated);
    UtilsQuery.joinGenotypesFromGenerations(context.queryRelated);
    UtilsQuery.joinPlantsFromGenotypes(context.queryRelated);
  }

  /**
     * We need to know familyIds, generationIds, genotypeIds and plantIds.
     * They all can get deleted, so query them.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
  static setQueryRelatedFields(context, criteria) {
    context.queryRelated
      .field(
        Utils.explicitColumn(CONSTANTS.TABLE_FAMILY, CONSTANTS.ATTR_ID_FAMILY))
      .field(
        Utils.explicitColumn(CONSTANTS.TABLE_GENERATION, CONSTANTS.ATTR_ID_GENERATION))
      .field(
        Utils.explicitColumn(CONSTANTS.TABLE_GENOTYPE, CONSTANTS.ATTR_ID_GENOTYPE))
      .field(
        Utils.explicitColumn(CONSTANTS.TABLE_PLANT, CONSTANTS.ATTR_ID_PLANT));
  }

  /**
     * We want to extract all the ids which get deleted from context.rowsRelated
     * and save them in context.{NAME}IdsToDelete.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
  static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
    context.familyIdsToDelete = new Set();
    context.generationIdsToDelete = new Set();
    context.genotypeIdsToDelete = new Set();
    context.plantIdsToDelete = new Set();

    for(let row of context.rowsRelated) {
      // now we iterate over each row and add all ids to the matching
      // context.xyzIdsToDelete. It's possible that we also add a null
      // field, but we will take care of that later
      context.familyIdsToDelete.add(row.familyId);
      context.generationIdsToDelete.add(row.generationId);
      context.genotypeIdsToDelete.add(row.genotypeId);
      context.plantIdsToDelete.add(row.plantId);
    }

    context.familyIdsToDelete = Utils.whereSetNotNull(
      context.familyIdsToDelete);
    context.generationIdsToDelete = Utils.whereSetNotNull(
      context.generationIdsToDelete);
    context.genotypeIdsToDelete = Utils.whereSetNotNull(
      context.genotypeIdsToDelete);
    context.plantIdsToDelete = Utils.whereSetNotNull(
      context.plantIdsToDelete);

    context.haveIdsToDelete = context.familyIdsToDelete.length > 0;

    logger.debug(this.name, '#delete() familyIdsToDelete:', context.familyIdsToDelete);
    logger.debug(this.name, '#delete() generationIdsToDelete:', context.generationIdsToDelete);
    logger.debug(this.name, '#delete() genotypeIdsToDelete:', context.genotypeIdsToDelete);
    logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
  }

  /**
     * Now set which families we want to delete. This is simply all ids in
     * context.familyIdsToDelete. generationIdsToDelete etc. will also get
     * deleted, but automatically from sqlite because of the foreign key
     * references and the ON DELETE CASCADE instruction in the table structure.
     * See src/create-tables for more information about table structure.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
  static setQueryDeleteWhere(context, criteria) {
    context.queryDelete
      .where('families.familyId IN ?', context.familyIdsToDelete);
  }

  /**
     * Build returnObject. Just assign returnObject.{NAME} to
     * context.{NAME}IdsToDelete
     * @param  {object} returnObject
     *         returnObject, an empty assoc array which will get returned at the
     *         end of #delete()
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
  static buildReturnObject(returnObject, context, criteria) {
    returnObject['families'] = context.familyIdsToDelete;
    returnObject['generations'] = context.generationIdsToDelete;
    returnObject['genotypes'] = context.genotypeIdsToDelete;
    returnObject['plants'] = context.plantIdsToDelete;
  }
}

FamilyDelete.TABLE = CONSTANTS.TABLE_FAMILY;

FamilyDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_FAMILY;

module.exports = FamilyDelete;
