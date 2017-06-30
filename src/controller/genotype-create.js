'use strict';

const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

const GenericCreate = require('./generic-create');


class GenotypeCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeString(options, 'genotypeName');
    Utils.hasToBeSet(options, 'generationId');
    Utils.hasToBeInt(options, 'generationId');
  }

  static setQueryFields(context, options) {
    context.query
      .set('genotypeId', null)
      .set('genotypeName', options.genotypeName)
      .set('generationId', options.generationId);
  }

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
