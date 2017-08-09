'use strict';

const CONSTANTS = require('../constants');
const Utils = require('../utils');

const GenericCreate = require('./generic-create');

/**
 * GentopyeCreate Class which creates a new Genotype.
 * Gets internally called from Genotype.create(). If you want
 * to know how Create works internally, see
 * src/controller/generic-create.
 * If you want to know how to use the Genotype.create()
 * API from outside, see src/models/Genotype #create().
 * @private
 * @extends GenericCreate
 */
class GenotypeCreate extends GenericCreate {

    /**
   * We need to validate input and throw errors if we're
   * unhappy with it.
   * @param  {object} returnObject
   *         object which will find returned from #create().
   * @param  {object} context
   *         internal context object in #create().
   * @throws {Error}
   */
    static validateOptions(context, options) {
        Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_GENOTYPE);
        Utils.hasToBeSet(options, CONSTANTS.ATTR_ID_GENERATION);
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_GENERATION);
    }

    /**
   * We want to catch foreign key error to custom throw error that genotype
   * reference failed.
   * @async
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         If generationId reference fails we will throw custom error,
   *         everything else should be a sqlite error.
   */
    static async executeQuery(context, options) {
        try {
            await super.executeQuery(context, options);
        } catch (err) {
            // We only have one foreign key so we can safely assume, if a foreign key constraint
            // fails, it's the generationId constraint.
            if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
                throw new Error('options.generationId does not reference an existing Generation');
            }
            throw err;
        }
    }
}

GenotypeCreate.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeCreate.ATTR_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenotypeCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_GENOTYPE;

GenotypeCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE;

GenotypeCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_GENOTYPE;

GenotypeCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_GENOTYPE]: '',
    [CONSTANTS.ATTR_NAME_GENOTYPE]: ''
};

GenotypeCreate.PLURAL = CONSTANTS.PLURAL_GENOTYPE;

module.exports = GenotypeCreate;
