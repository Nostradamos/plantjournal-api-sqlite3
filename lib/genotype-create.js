'use strict';

const CONSTANTS = require('./constants');
const GenericCreate = require('./generic-create');
const logger = require('./logger');
const squel = require('squel');
const Utils = require('./utils');


class GenotypeCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeString(options, 'genotypeName');
    Utils.hasToBeSet(options, 'generationId');
    Utils.hasToBeInt(options, 'generationId');
  }

  static buildQuery(context, options) {
    // Set fields
    context.query
    .set('genotypeId', null)
    .set('genotypeName', options.genotypeName)
    .set('generationId', options.generationId);
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
}

GenotypeCreate.table = CONSTANTS.TABLE_GENOTYPES;
GenotypeCreate.fieldCreatedAt = "genotypeCreatedAt";
GenotypeCreate.fieldModifiedAt = "genotypeModifiedAt";

module.exports = GenotypeCreate;
