'use strict';

const logger = require('../../logger');

const GenericDelete = require('../generic/generic-delete');

/**
 * Adapt GenericDelete to better fit the needs of log delete operations.
 */
class GenericLogDelete extends GenericDelete {
    /**
     * For logs we only have to select the id field (ATTR_ID), because
     * we won't delete any other related records as it is for "normal"
     * delete operations.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field(this.ATTR_ID);
    }

    /**
     * Generic method to extract the log ids to delete and safe them
     * into context.logsToDelete.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static extractIdsToDelete(context, criteria) {
        context.logsToDelete = [];

        for(let row of context.rowsRelated) {
            context.logsToDelete.push(
                row[this.ATTR_ID]
            );
        }

        logger.debug(this.name, '#delete() logsToDelete:', context.logsToDelete);
    }

    /**
     * We only have to delete records with the ids which are in
     * context.logsToDelete
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete.where(
            '?.? IN ?',
            this.TABLE,
            this.ATTR_ID,
            context.logsToDelete
        );
    }

    /**
     * returnObject only has to contain context.logsToDelete.
     * @param  {object} returnObject
     *         returnObject, an empty assoc array which will get returned at the
     *         end of #delete()
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static buildReturnObject(returnObject, context, criteria) {
        returnObject[this.PLURAL] = context.logsToDelete;
    }
}

GenericLogDelete.TABLE;

GenericLogDelete.ATTRIBUTES_SEARCHABLE;

GenericLogDelete.OVERWRITE_TABLE_LOOKUP = null;

/*******************
 * GenericLogDelete specific class attributes.
 *******************/

// Name of the id attribute of the log table
// Eg: plantLogId
GenericLogDelete.ATTR_ID;

// Plural of GenericLogDelete instance.
// Eg: plantlogs/mediumlogs.
GenericLogDelete.PLURAL;

module.exports = GenericLogDelete;
