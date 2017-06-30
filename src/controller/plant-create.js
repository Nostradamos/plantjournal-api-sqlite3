'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const Genotype = require('../models/genotype');
const GenericCreate = require('./generic-create');


class PlantCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeSet(options, 'plantName');
    Utils.hasToBeString(options, 'plantName');
    Utils.hasToBeInt(options, 'plantClonedFrom');
    Utils.hasToBeInt(options, 'genotypeId');
    Utils.hasToBeInt(options, 'generationId');

    // Either generationId or genotypeId has to be set.
    if(!_.has(options, 'generationId') &&
       !_.has(options, 'genotypeId') &&
       !_.has(options, 'plantClonedFrom')) {
         throw new Error(
           'Either options.generationId, options.genotypeId or options.plantClonedFrom has to be set'
         );
    }

    // plantSex has to be either male, female or hermaphrodite
    if(_.has(options, 'plantSex') &&
       _.indexOf(CONSTANTS.PLANT_SEXES, options.plantSex) === -1) {
         throw new Error(
           'options.plantSex has to be null, male, female or hermaphrodite'
         );
    }

    context.genotypeId = options.genotypeId;
    context.createdGenotype = false;
  }

  static setQueryFields(context, options) {
    context.query
      .set('plantId', null)
      .set('plantName', options.plantName)
      .set('plantClonedFrom', options.plantClonedFrom || null)
      .set('plantSex', options.plantSex || null)
      .set('genotypeId', '$genotypeId', {'dontQuote': true});
  }

  static async createGenotypeOrResolveGenotypeIdIfNeeded(context, options) {

    if(_.isUndefined(context.genotypeId) && _.isUndefined(options.plantClonedFrom)) {
      // If neither genotypeId nor plantClonedFrom is set, we want to create a new genotypeId
      // for this plant.
      logger.debug(this.name, "#create() We need to create a new genotype for this plant");

      context.createdGenotype = await Genotype.create(options);
      context.genotypeId = _.parseInt(_.keys(context.createdGenotype.genotypes)[0]);

      logger.debug(this.name, "#create() Created genotypeId:", context.genotypeId);
    }else if(!_.isUndefined(options.plantClonedFrom)) {
      // plantClonedFrom is defined, but genotypId not, so we wan't to retrieve
      // the genotypeId from the "mother plant". Mother plant => plant with the
      // id equaling plantClonedFrom.
      let queryRetrieveGenotypeId = 'SELECT plants.genotypeId FROM ' + CONSTANTS.TABLE_PLANTS + ' plants WHERE plants.plantId = $plantClonedFrom';
      logger.debug(this.name, "#create() queryRetrieveGenotypeId:", queryRetrieveGenotypeId, '? = :', options.plantClonedFrom);

      let motherPlantRow = await sqlite.get(
        queryRetrieveGenotypeId,
        {
          '$plantClonedFrom': options.plantClonedFrom
        }
      );

      if(_.isUndefined(motherPlantRow)) {
        // No row == no such plant
        await sqlite.get('ROLLBACK');
        throw new Error('options.plantClonedFrom does not reference an existing Plant');

      }
      context.genotypeId = motherPlantRow['genotypeId'];
      logger.debug(this.name, '#create() genotypeId:', context.genotypeId);
    }else {
      context.genotypeId = options.genotypeId;
    }
  }

  static async executeQueryInsertPlant(context, options) {
    console.log(context.query, context.genotypeId);
    try {
      context.result = await sqlite.run(context.query, {'$genotypeId': context.genotypeId});
    } catch(err) {
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        await sqlite.get('ROLLBACK');
        throw new Error('options.genotypeId does not reference an existing Genotype');
      }
      throw err;
    }
    logger.debug(this.name, '#create() result:', context.result);
    context.insertId = context.result.stmt.lastID;
  }

  static async executeQuery(context, options) {
    await sqlite.get('BEGIN');

    // we need to make sure we have a genotypeId. Therefore we try to resolve
    // it from motherPlant or create a new genotype. genotypeId will always
    // be in context.genotypeId
    await this.createGenotypeOrResolveGenotypeIdIfNeeded(context, options);

    await this.executeQueryInsertPlant(context, options);


    await sqlite.get('COMMIT');
  }

  static buildReturnObject(returnObject, context, options) {
    returnObject['plants'] = {};

    returnObject.plants[context.insertId] = {
      'plantId': context.insertId,
      'plantName': options.plantName,
      'plantClonedFrom': options.plantClonedFrom || null,
      'plantSex': options.plantSex || null,
      'plantCreatedAt': context.createdAt,
      'plantModifiedAt': context.modifiedAt,
      'genotypeId': context.genotypeId,
    }

    // if we created a new genotype we also want to have it in the returned
    // plant object.
    if(context.createdGenotype !== false) {
      returnObject.genotypes = context.createdGenotype.genotypes;
    }
  }
}

PlantCreate.TABLE = CONSTANTS.TABLE_PLANTS;

PlantCreate.ALIAS_CREATED_AT = 'plantCreatedAt';

PlantCreate.ALIAS_MODIFIED_AT = 'plantModifiedAt';

module.exports = PlantCreate;
