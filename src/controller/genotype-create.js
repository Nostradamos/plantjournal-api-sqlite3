'use strict';

const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
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
  static validate(context, options) {
    Utils.hasToBeString(options, 'genotypeName');
    Utils.hasToBeSet(options, 'generationId');
    Utils.hasToBeInt(options, 'generationId');
  }

  /**
   * We need to set some fields for query.
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   */
  static setQueryFields(context, options) {
    context.query
      .set('genotypeId', null)
      .set('genotypeName', options.genotypeName)
      .set('generationId', options.generationId);
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
    }catch(err) {
      // We only have one foreign key so we can safely assume, if a foreign key constraint
      // fails, it's the generationId constraint.
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.generationId does not reference an existing Generation');
      }
      throw err;
    }
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
    console.log(options);
    returnObject.genotypes = {};
    returnObject.genotypes[context.insertId] = {
      'genotypeId': context.insertId,
      'genotypeName': options.genotypeName || null,
      'genotypeCreatedAt': context.createdAt,
      'genotypeModifiedAt': context.modifiedAt,
      'generationId': options.generationId,
    }
  }

}

GenotypeCreate.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeCreate.ALIAS_CREATED_AT = CONSTANTS.CREATED_AT_ALIAS_GENOTYPE;

GenotypeCreate.ALIAS_MODIFIED_AT = CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE;

module.exports = GenotypeCreate;
