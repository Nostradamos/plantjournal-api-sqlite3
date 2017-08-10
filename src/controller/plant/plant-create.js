'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils');
const Genotype = require('../../models/genotype');

const GenericCreate = require('../generic/generic-create');

/**
 * PlantCreate Class which creates a new Plant.
 * Gets internally called from Plant.create(). If you want
 * to know how Create works internally, see
 * src/controller/generic-create.
 * If you want to know how to use the Plant.create()
 * API from outside, see src/models/Plant #create().
 * @private
 * @extends GenericCreate
 */
class PlantCreate extends GenericCreate {

    /**
   * We need to validate input and throw errors if we're unhappy with it.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, 'plantName');
        Utils.hasToBeString(options, 'plantName');
        Utils.hasToBeInt(options, 'plantClonedFrom');
        Utils.hasToBeInt(options, 'genotypeId');
        Utils.hasToBeInt(options, 'generationId');

        // Either generationId or genotypeId has to be set.
        if (!_.has(options, 'generationId') &&
       !_.has(options, 'genotypeId') &&
       !_.has(options, 'plantClonedFrom')) {
            throw new Error(
                'Either options.generationId, options.genotypeId or options.plantClonedFrom has to be set'
            );
        }

        // plantSex has to be either male, female or hermaphrodite
        if (_.has(options, 'plantSex') &&
       _.indexOf(CONSTANTS.PLANT_SEXES, options.plantSex) === -1) {
            throw new Error(
                'options.plantSex has to be null, male, female or hermaphrodite'
            );
        }

        context.genotypeId = options.genotypeId;
        context.createdGenotype = false;
    }

    /**
   * We need to set some attributes for query.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
    static setQueryFields(context, options) {
        super.setQueryFields(context, options);
        context.query
            .set('genotypeId', '$genotypeId', {'dontQuote': true});
    }

    /**
   * If needed (options.genotypId is not set) we need to create a new genotype
   * (if options.plantClonedFrom is also unset) or resolve it from the plant
   * with the plantClonedFrom id. The created or resolved genotypeId will
   * be in context.genotypeId. Also if options.genotyeId is set, we will set
   * context.genotypeId to the one from options.genotypeId.
   * @async
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         Throws error if we can't resolve genotypeId, because
   *         plantClonedFrom does not reference an existing plant.
   *         Or if sqlite throws an unexpected error.
   */
    static async createGenotypeOrResolveGenotypeIdIfNeeded(context, options) {
        if (_.isUndefined(context.genotypeId) && _.isUndefined(options.plantClonedFrom)) {
            // If neither genotypeId nor plantClonedFrom is set, we want to create a new genotypeId
            // for this plant.
            logger.debug(this.name, '#create() We need to create a new genotype for this plant');

            context.createdGenotype = await Genotype.create(options);
            context.genotypeId = _.parseInt(_.keys(context.createdGenotype.genotypes)[0]);

            logger.debug(this.name, '#create() Created genotypeId:', context.genotypeId);
        } else if (!_.isUndefined(options.plantClonedFrom)) {
            // plantClonedFrom is defined, but genotypId not, so we wan't to retrieve
            // the genotypeId from the "mother plant". Mother plant => plant with the
            // id equaling plantClonedFrom.
            let queryRetrieveGenotypeId = 'SELECT plants.genotypeId FROM ' +
                                    CONSTANTS.TABLE_PLANTS +
                                    ' plants WHERE plants.plantId = $plantClonedFrom';

            logger.debug(this.name, '#create() queryRetrieveGenotypeId:',
                queryRetrieveGenotypeId, '? = :', options.plantClonedFrom);

            let motherPlantRow = await sqlite.get(
                queryRetrieveGenotypeId,
                {'$plantClonedFrom': options.plantClonedFrom}
            );

            if (_.isUndefined(motherPlantRow)) {
                // No row == no such plant
                await sqlite.get('ROLLBACK');
                throw new Error('options.plantClonedFrom does not reference an existing Plant');

            }
            context.genotypeId = motherPlantRow['genotypeId'];
            logger.debug(this.name, '#create() genotypeId:', context.genotypeId);
        } else {
            context.genotypeId = options.genotypeId;
        }
    }

    /**
   * Executes the inserting of plant and throws custom error if genotypeId
   * reference fails.
   * We need to execute context.query with a paramater for genotypeId, so can't
   * use GenericCreate.executeQuery(). Besides this, we want to execute a
   * rollback command if insertion fails. It's possible that we created a
   * genotype before for this plant, so undo that.
   * @async
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         We throw an error if reference for genotype fails. Otherwise
   *         we will give back all other unexpected errors.
   */
    static async executeQueryInsertPlant(context, options) {
        try {
            context.result = await sqlite.run(context.query, {'$genotypeId': context.genotypeId});
        } catch (err) {
            // it's possible that we created a genotype for this, undo it.
            await sqlite.get('ROLLBACK');
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.genotypeId does not reference an existing Genotype');
            }
            throw err;
        }

        logger.debug(this.name, '#create() result:', context.result);
        context.insertId = context.result.stmt.lastID;
    }

    /**
   * It's possible we need to create a genotype for this plant. If this is the
   * case we have to create genotype before plant. To undo the insert of
   * genotype if shit happens, we need to do this in a transaction.
   * @async
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         Any errors from #createGenotypeOrResolveGenotypeIdIfNeeded() or
   *         #executeQueryInsertPlant() or unexpected sqlite errors.
   */
    static async executeQuery(context, options) {
        await sqlite.get('BEGIN');

        // we need to make sure we have a genotypeId. Therefore we try to resolve
        // it from motherPlant or create a new genotype. genotypeId will always
        // be in context.genotypeId
        await this.createGenotypeOrResolveGenotypeIdIfNeeded(context, options);

        await this.executeQueryInsertPlant(context, options);


        await sqlite.get('COMMIT');
    }

    /**
   * Build the Generation object which should get returned. just
   * insert all info we have, this is enough.
   * @param  {object} returnObject
   *         object which will find returned from #create()
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
    static buildReturnObject(returnObject, context, options) {
        super.buildReturnObject(returnObject, context, options);

        // if we created a new genotype we also want to have it in the returned
        // plant object.
        if (context.createdGenotype !== false) {
            returnObject.genotypes = context.createdGenotype.genotypes;
        }
    }
}

PlantCreate.TABLE = CONSTANTS.TABLE_PLANTS;

PlantCreate.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_PLANT;

PlantCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT;

PlantCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_PLANT;

PlantCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_PLANT]: ''
};

PlantCreate.PLURAL = CONSTANTS.PLURAL_PLANT;

module.exports = PlantCreate;
