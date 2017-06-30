'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

const GenericCreate = require('./generic-create');


class GenerationCreate extends GenericCreate {

  static validate(context, options) {
    Utils.hasToBeSet(options, 'generationName');
    Utils.hasToBeString(options, 'generationName');
    Utils.hasToBeIntArray(options, 'generationParents');
    Utils.hasToBeSet(options, 'familyId');
    Utils.hasToBeInt(options, 'familyId');
  }

  static setQueryFields(context, options) {
    context.query
      .set('generationId', null)
      .set('generationName', options.generationName)
      .set('familyId', options.familyId);
  }

  static buildQueryInsertParentsIfNeeded(context, options) {
    // No parents, nothing to do
    if(_.isEmpty(options.generationParents)) return;

    let fieldsRows = [];
    _.each(options.generationParents, function(parentPlantId) {
      fieldsRows.push({parentId: null, generationId: context.insertId, plantId: parentPlantId});
    });

    context.queryInsertParents = squel.insert().into(this.TABLE_PARENTS)
      .setFieldsRows(fieldsRows)
      .toString();

    logger.debug(this.name, '#create() queryInsertParents:', context.queryInsertParents);
  }

  static async executeQueryInsertGeneration(context, options) {
    try {
      await super.executeQuery(context, options);
    } catch(err) {
      // We only have one foreign key so we can safely assume, if a foreign key constraint
      // fails, it's the familyId constraint.
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.familyId does not reference an existing Family');
      }
      throw err;
    }
  }

  static async executeQueryInsertParentsIfNeeded(context, options) {
    // If we don't have a query, do nothing
    if(_.isUndefined(context.queryInsertParents)) return;
    try {
      await sqlite.get(context.queryInsertParents);
    } catch(err) {
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        await sqlite.get('ROLLBACK');
        throw new Error('options.generationParents contains at least one plantId which does not reference an existing plant');
      }
      throw err;
    }

  }

  static async executeQuery(context, options) {

    // Execute insertion in a transaction block so we can rollback if inserting
    // parants fails
    await sqlite.get('BEGIN');
    await this.executeQueryInsertGeneration(context, options);

    // Sadly not possible to do this before, because we need insertId
    this.buildQueryInsertParentsIfNeeded(context, options);
    await this.executeQueryInsertParentsIfNeeded(context, options);
    await sqlite.get('COMMIT');
  }

  static buildReturnObject(returnObject, context, options) {
    console.log(options);
    returnObject.generations = {};
    returnObject.generations[context.insertId] = {
      'generationId': context.insertId,
      'generationName': options.generationName,
      'generationParents': options.generationParents || [],
      'generationCreatedAt': context.createdAt,
      'generationModifiedAt': context.modifiedAt,
      'familyId': options.familyId,
    }
  }
}

GenerationCreate.TABLE = CONSTANTS.TABLE_GENERATIONS;
GenerationCreate.TABLE_PARENTS = CONSTANTS.TABLE_GENERATION_PARENTS;
GenerationCreate.ALIAS_CREATED_AT = CONSTANTS.CREATED_AT_ALIAS_GENERATION;
GenerationCreate.ALIAS_MODIFIED_AT = CONSTANTS.MODIFIED_AT_ALIAS_GENERATION;

module.exports = GenerationCreate;
