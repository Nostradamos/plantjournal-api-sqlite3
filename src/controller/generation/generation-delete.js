'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * This class extends {@link GenericDelete} to fit the needs for Generation
 * deletions. The delete() method gets called internally from
 * Generation.delete().
 * If you want to know how delete works internally, see
 * {@link GenericCreate|src/controller/generic-create}.
 * If you want to know how to use the Generation.delete()
 * API from outside, see {@link Generation|src/models/Generation #create()}.
 * @private
 * @extends GenericDelete
 */
class GenerationDelete extends GenericDelete {

    /**
   * We need to join some tables, to know which ids we will delete.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedJoin(context, criteria) {
        QueryUtils.joinGenotypesDownwards(context.queryRelated);
        QueryUtils.joinPlantsDownwards(context.queryRelated);
    }

    /**
   * We need to select all id attributes because we want to know which ids
   * we will delete.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('generations.generationId')
            .field('genotypes.genotypeId')
            .field('plants.plantId');
    }

    /**
   * Extract the id attributes from the rows and save them.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static extractIdsToDelete(context, criteria) {
    // It's very possible that we have the same model id's multiple
    // times in our rows, therefore we use Set() which makes sure each
    // id is only once present in our datastructure.
        context.generationIdsToDelete = new Set();
        context.genotypeIdsToDelete = new Set();
        context.plantIdsToDelete = new Set();

        _.each(context.rowsRelated, function(row) {
            //   now we iterate over each row and add all ids to the matching
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

    /**
   * For delete query, set which generationIds to delete. Genotypes & plants
   * will also get deleted, because of foreign keys and on delete cascade.
   * See {@link create-tables|src/create-tables}.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('generations.generationId IN ?', context.generationIdsToDelete);
    }

    /**
   * Build the return Object, just assign the array of ids as value and lower
   * cased model name as key to returnObject.
   * @param  {object} returnObject
   *         returnObject, an empty assoc array which will get returned at the
   *         end of #delete()
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static buildReturnObject(returnObject, context, criteria) {
        returnObject['generations'] = context.generationIdsToDelete;
        returnObject['genotypes'] = context.genotypeIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}

GenerationDelete.TABLE = CONSTANTS.TABLE_GENERATIONS;

GenerationDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENERATION;

module.exports = GenerationDelete;
