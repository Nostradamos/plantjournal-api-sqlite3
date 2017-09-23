'use strict';

const _ = require('lodash');

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsQuery = require('../../utils/utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * This class extends {@link GenericDelete} to fit the needs for Medium
 * deletions. The delete() method gets called internally from Medium.delete().
 * If you want to know how delete works internally, see
 * {@link GenericCreate|src/controller/generic/generic-create}.
 * If you want to know how to use the Medium.delete()
 * API from outside, see {@link Genotype|src/models/Medium #delete()}.
 * @private
 * @extends GenericDelete
 */
class MediumDelete extends GenericDelete {

    /**
     * Because we don't only want to delete mediums, but also related
     * plants, we want to know all them. SQLITE will make sure
     * that they will get deleted, but without us knowing that. So get them.
     * We need this information for the later return object (and in future
     * for onDelete events.).
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedJoin(context, criteria) {
        UtilsQuery.joinPlantsFromMediums(context.queryRelated);
    }

    /**
     * We need to know mediumId and plantId.
     * They all can get deleted, so select them.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('mediums.mediumId')
            .field('plants.plantId');
    }

    /**
     * We want to extract all the ids which we queried before and which will
     * get deleted later when we fire the DELETE command.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static extractIdsToDelete(context, criteria) {
        context.mediumIdsToDelete = new Set();
        context.plantIdsToDelete = new Set();

        _.each(context.rowsRelated, function(row) {
            context.mediumIdsToDelete.add(row.mediumId);
            context.plantIdsToDelete.add(row.plantId);
        });

        context.mediumIdsToDelete = Utils.whereSetNotNull(
            context.mediumIdsToDelete);
        context.plantIdsToDelete = Utils.whereSetNotNull(
            context.plantIdsToDelete);

        context.haveIdsToDelete = context.mediumIdsToDelete.length > 0;

        logger.debug(
            this.name, '#delete() mediumIdsToDelete:',
            context.mediumIdsToDelete);
        logger.debug(
            this.name, '#delete() plantIdsToDelete:',
            context.plantIdsToDelete);
    }

    /**
     * We need to apply the mediumsId's to delete to the queryDelete.
     * plants will get deleted automatically by sqlite because
     * of the foreign key and ON DELETE CASCADE. See create-tables.js
     * for table schema/instructions.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('mediums.mediumId IN ?', context.mediumIdsToDelete);
    }

    /**
     * Build returnObject. It should contain all deleted ids for the various
     * models.
     * @param  {object} returnObject
     *         returnObject, an empty assoc array which will get returned at the
     *         end of #delete()
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static buildReturnObject(returnObject, context, criteria) {
        returnObject['mediums'] = context.mediumIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}

MediumDelete.TABLE = CONSTANTS.TABLE_MEDIUM;

MediumDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_MEDIUM;

module.exports = MediumDelete;
