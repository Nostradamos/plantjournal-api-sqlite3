'use strict';

const CONSTANTS = require('./constants');
const GenericCreate = require('./generic-create');
const logger = require('./logger');
const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');
const Utils = require('./utils');


class GenerationCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeSet(options, 'generationName');
    Utils.hasToBeString(options, 'generationName');
    Utils.hasToBeIntArray(options, 'generationParents');
    Utils.hasToBeSet(options, 'familyId');
    Utils.hasToBeInt(options, 'familyId');

    // Only if options.generationParents is set and has more than one element,
    // we want to add those plant ids into generation_parents.
    context.addParents = options.generationParents && options.generationParents.length > 0;
  }

  static initQuery(context, options) {
    context.queryGeneration = squel.insert().into(this.table);
  }

  static buildQuery(context, options) {
    context.queryGeneration
      .set('generationId', null)
      .set('generationName', options.generationName)
      .set('familyId', options.familyId);
  }

  /**
   * We changed query names and we have two instead of one query because
   * of the generationParents subquery. Therefore we have to add createdAt
   * and modifiedAt differently.
   * @param  {[type]} context [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  static buildQueryAddCreatedAndModifiedAt(context, options) {
    context.createdAt = context.modifiedAt = Utils.getUnixTimestampUTC();
    context.queryGeneration
      .set("createdAt", context.createdAt)
      .set('modifiedAt', context.modifiedAt);
  }


  static stringifyQuery(context, options) {
    context.queryGeneration = context.queryGeneration.toString();
    logger.debug(this.name, '#create() queryGeneration:', context.queryGeneration);
  }

  static buildQueryParents(context, options) {
    let fieldsRows = [];
    _.each(options.generationParents, function(parentPlantId) {
      fieldsRows.push({parentId: null, generationId: context.insertId, plantId: parentPlantId});
    });
    console.log(context.queryGenerationParents);
    context.queryGenerationParents = squel.insert().into(this.tableParents)
      .setFieldsRows(fieldsRows)
      .toString();
    logger.debug(this.name, '#create() queryGenerationParents:', context.queryGenerationParents);
  }

  static async executeQuery(context, options) {
    try {
      context.resultGeneration = await sqlite.run(context.queryGeneration);
    } catch(err) {
      // We only have one foreign key so we can safely assume, if a foreign key constraint
      // fails, it's the familyId constraint.
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.familyId does not reference an existing Family');
      }
      throw err;
    }
    context.insertId = context.resultGeneration.stmt.lastID;
    logger.debug(this.name, '#create() resultGeneration:', context.resultGeneration);

    if(context.addParents === true) {
      this.buildQueryParents(context, options);
      context.resultParents = await sqlite.run(context.queryGenerationParents);
      logger.debug(this.name, '#create() resultParents:', context.resultParents);
    }
  }

  static buildReturnObject(returnObject, context, options) {
    console.log(options);
    returnObject.generations = {};
    returnObject.generations[context.insertId] = {
      'generationId': context.insertId,
      'generationName': options.generationName,
      'generationParents': options.generationParents || [],
      'familyId': options.familyId,
      'createdAt': context.createdAt,
      'modifiedAt': context.modifiedAt,
    }
  }
}

GenerationCreate.table = CONSTANTS.TABLE_GENERATIONS;
GenerationCreate.tableParents = CONSTANTS.TABLE_GENERATION_PARENTS;
module.exports = GenerationCreate;
