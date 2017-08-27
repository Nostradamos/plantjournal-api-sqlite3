'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

/**
 * GenerationCreate Class which creates a new Generation.
 * Gets internally called from Generation.create(). If you want
 * to know how Create works internally, see
 * src/controller/generic-create.
 * If you want to know how to use the Generation.create()
 * API from outside, see src/models/Generation #create().
 * @private
 * @extends GenericCreate
 */
class GenerationCreate extends GenericCreate {

    /**
     * We need to validate input and throw errors if we're unhappy with it.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Throws error if we are unhappy with the options object.
     */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, 'generationName');
        Utils.hasToBeString(options, 'generationName');
        Utils.hasToBeIntArray(options, 'generationParents');
        Utils.hasToBeString(options, 'generationDescription');
        Utils.hasToBeSet(options, 'familyId');
        Utils.hasToBeInt(options, 'familyId');
    }

    /**
     * We need to set some attributes for query.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static setQueryFields(context, options) {
        context.query
            .set('generationId', null)
            .set('generationName', options.generationName)
            .set('generationDescription', options.generationDescription)
            .set('familyId', options.familyId);
    }

    /**
     * If we have generationParents in options, we need to  build a second query
     * to insert parents into the generation_parents table. Query will be in
     * context.queryInsertParents. We won't execute query, for this see
     * #executeQueryInsertGeneration().
     * This method is NOT part of GenericCreate but specific to GenerationCreate.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static buildQueryInsertParentsIfNeeded(context, options) {
    // No parents, nothing to do
        if (_.isEmpty(options.generationParents)) return;

        // for every plant we have to insert a own row.
        let attributesRows = [];

        _.each(options.generationParents, function(parentPlantId) {
            attributesRows.push({parentId: null, generationId: context.insertId, plantId: parentPlantId});
        });

        // build and stringify query
        context.queryInsertParents = squel.insert().into(this.TABLE_PARENTS)
            .setFieldsRows(attributesRows)
            .toString();

        logger.debug(this.name, '#create() queryInsertParents:', context.queryInsertParents);
    }

    /**
     * This function will execute the generation insert. This function won't
     * insert any parents, only generation. Basically wraps around
     * GenericCreate.create() to catch foreign key error.
     * This method is NOT part of GenericCreate but specific to GenerationCreate.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Will throw error if options.familyId does not reference an
     *         existing family.
     */
    static async executeQueryInsertGeneration(context, options) {
        try {
            await super.executeQuery(context, options);
        } catch (err) {
            await sqlite.get('ROLLBACK');
            // We only have one foreign key so we can safely assume, if a foreign key constraint
            // fails, it's the familyId constraint.
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.familyId does not reference an existing Family');
            }
            throw err;
        }
    }

    /**
     * If needed, this method will execute the query to insert the generation
     * parents. Generation has to be inserted before! Will rollback if this
     * fails.
     * This method is NOT part of GenericCreate but specific to GenerationCreate.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         We hope generationId is valid (because we created it before in
     *         #executeQueryInsertGeneration()) so we can assume if get a foreign
     *         key error, it's because of familyId. We will throw a custom error
     *         in this case. Other errors should only be unexpected sqlite errors.
     */
    static async executeQueryInsertParentsIfNeeded(context, options) {
    // If we don't have a query, do nothing
        if (_.isUndefined(context.queryInsertParents)) return;
        try {
            await sqlite.get(context.queryInsertParents);
        } catch (err) {
            await sqlite.get('ROLLBACK'); // shit happend, roll back
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.generationParents contains at least one plantId which does not reference an existing plant');
            }
            throw err;
        }

    }

    /**
     * Because we have to generation and generation parents seperately, we want
     * to do this in a transaction so we can rollback if the second executed
     * query fails and no generation will be inserted.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Throws unexpected sqlite errors or errors thrown from
     *         executeQueryInsertParentsIfNeeded().
     */
    static async executeQuery(context, options) {

    // Execute insertion in a transaction block so we can rollback if inserting
    // parants fails
        await sqlite.get('BEGIN');
        await this.executeQueryInsertGeneration(context, options);

        // Sadly not possible to do this before, because we need insertId
        this.buildQueryInsertParentsIfNeeded(context, options);

        // now insert parents. If this fails, called method will
        // roll back.
        await this.executeQueryInsertParentsIfNeeded(context, options);

        // end transaction
        await sqlite.get('COMMIT');
    }
}

GenerationCreate.TABLE = CONSTANTS.TABLE_GENERATIONS;

GenerationCreate.TABLE_PARENTS = CONSTANTS.TABLE_GENERATION_PARENTS;

GenerationCreate.ATTR_ID = CONSTANTS.ATTR_ID_GENERATION;

GenerationCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_GENERATION;

GenerationCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENERATION;

GenerationCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_GENERATION;

GenerationCreate.PLURAL = CONSTANTS.PLURAL_GENERATION;

GenerationCreate.DEFAULT_VALUES_ATTRIBUTES = {
    'generationParents': [],
    'generationDescription': ''
};

module.exports = GenerationCreate;
