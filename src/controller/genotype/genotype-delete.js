'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * This class extends {@link GenericDelete} to fit the needs for Genotype
 * deletions. The delete() method gets called internally from
 * Genotype.delete().
 * If you want to know how delete works internally, see
 * {@link GenericCreate|src/controller/generic-create}.
 * If you want to know how to use the Genotype.delete()
 * API from outside, see {@link Genotype|src/models/Genotype #create()}.
 * @private
 * @extends GenericDelete
 */
class GenotypeDelete extends GenericDelete {

    /**
     * We need to join Plants, because we will also delete plants if we delete
     * a genotype.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedJoin(context, criteria) {
        QueryUtils.joinPlantsFromGenotypes(context.queryRelated);
    }

    /**
     * We need to select both genotypeId and plantId to delete genotypes and
     * to know which plant we will delete.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
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

    /**
     * Set which genotypes to delete. We queried them before with queryWhere.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('genotypes.genotypeId IN ?', context.genotypeIdsToDelete);
    }

    /**
     * Build the returnObject. Just put deleted genotypes and plants into it.
     * @param  {object} returnObject
     *         returnObject, an empty assoc array which will get returned at the
     *         end of #delete()
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static buildReturnObject(returnObject, context, criteria) {
        returnObject['genotypes'] = context.genotypeIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}

GenotypeDelete.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE;

module.exports = GenotypeDelete;
