'use strict';

const _ = require('lodash');

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsQuery = require('../../utils/utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * The function of this class is to delete environments and related mediums
 * and plants. If you want to know how delete works internally, see
 * src/controller/generic/generic-delete. If you want to know how to use the
 * Family.delete() API, see src/models/environment #delete. If you want to
 * execute EnvironmentDelete manually, just call EnvironmentDelete.delete().
 * @private
 * @extends GenericDelete
 */
class EnvironmentDelete extends GenericDelete {

    /**
     * Because we don't only want to delete environments, but also related
     * mediums and plants, we want to know all them. SQLITE will make sure
     * that they will get deleted, but without us knowing that. So get them.
     * We need this information for the later return object (and in future
     * for onDelete events.).
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedJoin(context, criteria) {
        UtilsQuery.joinMediumsFromEnvironments(context.queryRelated);
        UtilsQuery.joinPlantsFromMediums(context.queryRelated);
    }

    /**
     * We need to know environmentId (obviously), mediumId and plantId.
     * They all can get deleted, so select them.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('environments.environmentId')
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
        context.environmentIdsToDelete = new Set();
        context.mediumIdsToDelete = new Set();
        context.plantIdsToDelete = new Set();

        for(let row of context.rowsRelated) {
            context.environmentIdsToDelete.add(row.environmentId);
            context.mediumIdsToDelete.add(row.mediumId);
            context.plantIdsToDelete.add(row.plantId);
        }

        context.environmentIdsToDelete = Utils
            .whereSetNotNull(context.environmentIdsToDelete);
        context.mediumIdsToDelete = Utils
            .whereSetNotNull(context.mediumIdsToDelete);
        context.plantIdsToDelete = Utils
            .whereSetNotNull(context.plantIdsToDelete);

        context.haveIdsToDelete = context.environmentIdsToDelete.length > 0;

        logger.debug(this.name, '#delete() environmentIdsToDelete:',
            context.environmentIdsToDelete);
        logger.debug(this.name, '#delete() mediumIdsToDelete:',
            context.mediumIdsToDelete);
        logger.debug(this.name, '#delete() plantIdsToDelete:',
            context.plantIdsToDelete);
    }

    /**
     * We need to apply the environmentId's to delete to the queryDelete.
     * Mediums and plants will get deleted automatically by sqlite because
     * of the foreign key and ON DELETE CASCADE. See create-tables.js
     * for table schema/instructions.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('environments.environmentId IN ?', context.environmentIdsToDelete);
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
        returnObject['environments'] = context.environmentIdsToDelete;
        returnObject['mediums'] = context.mediumIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}

EnvironmentDelete.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentDelete.ATTRIBUTES_SEARCHABLE =
    CONSTANTS.RELATED_ATTRIBUTES_ENVIRONMENT;

module.exports = EnvironmentDelete;
