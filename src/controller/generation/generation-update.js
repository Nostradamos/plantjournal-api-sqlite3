'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../../logger');
const UtilsQuery = require('../../utils/utils-query');

const CONSTANTS = require('../../constants');
const GenericUpdate = require('../generic/generic-update');

/**
 * GenerationUpdate Class. Basically does the update() stuff for
 * Generations. See GenericUpdate for more detailed information
 * on how Update internally works. If you want to know how
 * to use this, see src/models/generation #update().
 * @private
 * @extends GenericUpdate
 */
class GenerationUpdate extends GenericUpdate {

    /**
     * We need to join some tables to make all ATTRIBUTES_SEARCHABLE of generation
     * work.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
    static setQueryFindJoin(context, update, criteria) {
        UtilsQuery.joinRelatedGenerations(context.queryFind);
    }

    /**
     * We need to remove generationParents from queryUpdate.setFields.
     * generationParents has to get applied to TABLE_PARENTS and not normal
     * generation TABLE.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
    static setQueryUpdateFieldValues(context, update, criteria) {
    // generationParents has to be in a different table, so leave it out
    // for the main update query
        context.queryUpdate.setFields(
            _.omit(context.attributesToUpdate, 'generationParents')
        );
    }

    /**
     * Inits two new queries. queryDeleteOldParents
     * and queryInsertNewParents. First one is to delete
     * all old parents, second to insert new parent plant ids.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
    static initQueryUpdateParents(context, update, criteria) {
        // We have to delete the old parents, build query for this
        context.queryDeleteOldParents = squel.remove().from(this.TABLE_PARENTS)
            .where('generationId IN ?', context.idsToUpdate).toString();
        logger.debug(this.name, '#update() queryDeleteOldParents:', context.queryDeleteOldParents);

        // Wa have to insert new parents, build query for this
        let attributesRows = [];

        _.each(update.generationParents, function(parentPlantId) {
            _.each(context.idsToUpdate, function(generationId) {
                attributesRows.push({parentId: null, generationId: generationId, plantId: parentPlantId});
            });
        });
        context.queryInsertNewParents = squel.insert().into(this.TABLE_PARENTS)
            .setFieldsRows(attributesRows)
            .toString();
    }

    /**
     * Executes context.queryDeleteOldParents and context.queryInsertNewParents
     * in a transaction. If query fails because of foreign key, transaction
     * will get rolled back (deletes will be undone) and an Error will be thrown.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
    static async executeQueryUpdateParents(context, update, criteria) {
        try {
            await sqlite.get('BEGIN');
            await sqlite.get(context.queryDeleteOldParents);
            await sqlite.get(context.queryInsertNewParents);
            await sqlite.get('COMMIT');
        } catch (err) {
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                await sqlite.get('ROLLBACK'); // Undo delete
                throw new Error('update.generationParents does not reference to existing Plants. At least one reference is invalid.');
            }
            throw err;
        }
    }

    /**
     * We have to modify the behaviour of execution because we have to also
     * query TABLE_PARENTS if generationParents is in attributesToUpdate. Besides
     * that we catch foreign key errors and throw our own error.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
    static async executeQueryUpdate(context, update, criteria) {
        if (_.has(context.attributesToUpdate, 'generationParents')) {
            this.initQueryUpdateParents(context, update, criteria);
            await this.executeQueryUpdateParents(context, update, criteria);
        }

        try {
            await super.executeQueryUpdate(context, update, criteria);
        } catch (err) {
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('update.familyId does not reference an existing Family');
            }
            throw err;
        }
    }
}

GenerationUpdate.TABLE =  CONSTANTS.TABLE_GENERATION;

GenerationUpdate.TABLE_PARENTS = CONSTANTS.TABLE_GENERATION_PARENT;

GenerationUpdate.ATTR_ID = CONSTANTS.ATTR_ID_GENERATION;

GenerationUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENERATION;

GenerationUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENERATION;

GenerationUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_GENERATION;

module.exports = GenerationUpdate;
