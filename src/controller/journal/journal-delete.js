'use strict';

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericDelete = require('../generic/generic-delete');

/**
 * The function of this class is to delete journals and related mediums
 * and plants. If you want to know how delete works internally, see
 * src/controller/generic/generic-delete. If you want to know how to use the
 * Family.delete() API, see src/models/journal #delete. If you want to
 * execute JournalDelete manually, just call JournalDelete.delete().
 * @private
 * @extends GenericDelete
 */
class JournalDelete extends GenericDelete {
    /**
     * We need to know journalId (obviously)
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('journals.journalId');
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
        context.journalIdsToDelete = new Set();

        for(let row of context.rowsRelated) {
            context.journalIdsToDelete.add(row.journalId);
        }

        context.journalIdsToDelete = Utils
            .whereSetNotNull(context.journalIdsToDelete);

        context.haveIdsToDelete = context.journalIdsToDelete.length > 0;

        logger.debug(this.name, '#delete() journalIdsToDelete:',
            context.journalIdsToDelete);
    }

    /**
     * We need to apply the journalId's to delete to the queryDelete.
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
            .where('journals.journalId IN ?', context.journalIdsToDelete);
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
        returnObject['journals'] = context.journalIdsToDelete;
    }
}

JournalDelete.TABLE = CONSTANTS.TABLE_JOURNAL;

JournalDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_JOURNAL;

module.exports = JournalDelete;
