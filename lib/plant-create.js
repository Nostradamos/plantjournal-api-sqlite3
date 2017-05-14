'use strict';

const sqlite = require('sqlite');
const squel = require('squel');
const _ = require('lodash');
const CONSTANTS = require('./constants');
const GenericCreate = require('./generic-create');
const logger = require('./logger');
const Utils = require('./utils');
const Genotype = require('./genotype');


class PlantCreate extends GenericCreate {
  static validate(context, options) {
    Utils.hasToBeSet(options, 'plantName');
    Utils.hasToBeString(options, 'plantName');
    Utils.hasToBeInt(options, 'plantClonedFrom');
    Utils.hasToBeInt(options, 'genotypeId');
    Utils.hasToBeInt(options, 'generationId');

    // Either generationId or genotypeId has to be set.
    if(!_.has(options, 'generationId') && !_.has(options, 'genotypeId') && !_.has(options, 'plantClonedFrom')) throw new Error('Either options.generationId, options.genotypeId or options.plantClonedFrom has to be set');

    // plantSex has to be either male, female or hermaphrodite
    if(_.has(options, 'plantSex') && _.indexOf(CONSTANTS.PLANT_SEXES, options.plantSex) === -1) throw new Error('options.plantSex has to be null, male, female or hermaphrodite');

    context.genotypeId = options.genotypeId;
    context.createdGenotype = false;
  }

  static buildQuery(context, options) {
    context.query
      .set('plantId', null)
      .set('plantName', options.plantName)
      .set('plantClonedFrom', options.plantClonedFrom || null)
      .set('plantSex', options.plantSex || null);
  }

  static stringifyQuery(context, options) {
    // we want to not build the query object already here
  }

  static async createGenotypeOrResolveGenotypeIdIfNeeded(context, options) {
    if(_.isUndefined(context.genotypeId) && _.isUndefined(options.plantClonedFrom)) {
      // If neither genotypeId nor plantClonedFrom is set, we want to create a new genotypeId
      // for this plant.
      logger.debug(this.name + " #create() We need to create a new genotype for this plant");
      context.createdGenotype = await Genotype.create(options);
      context.genotypeId = _.parseInt(_.keys(context.createdGenotype.genotypes)[0]);
      logger.debug(this.name + " #create() Created genotypeId:", context.genotypeId);
    }else if(!_.isUndefined(options.plantClonedFrom)) {
      // plantClonedFrom is defined, but genotypId not, so we wan't to retrieve
      // the genotypeId from the "mother plant". Mother plant => plant with the
      // id equaling plantClonedFrom.
      let queryRetrieveGenotypeId = squel
        .select()
        .from(CONSTANTS.TABLE_PLANTS, 'plants')
        .field('plants.genotypeId')
        .where('plants.plantId = ?', options.plantClonedFrom)
        .limit(1)
        .toString();
      logger.debug(this.name + " #create() queryRetrieveGenotypeId:", queryRetrieveGenotypeId);

      let motherPlantRow = await sqlite.get(queryRetrieveGenotypeId);
      // No row == no such plant
      if(_.isUndefined(motherPlantRow)) throw new Error('options.plantClonedFrom does not reference an existing Plant');
      context.genotypeId = motherPlantRow['genotypeId'];
    }
  }

  static async executeQueryBefore(context, options) {
    // we need to make sure we have a genotypeId. Therefore we try to resolve
    // it from motherPlant or create a new genotype
    await this.createGenotypeOrResolveGenotypeIdIfNeeded(context, options);

    // then we finish the query building by setting the last field
    context.query.set('genotypeId', context.genotypeId);
    // and we build the query
    super.stringifyQuery(context, options);
  }

  static async executeQuery(context, options) {
    console.log("test");
    try {
      context.result = await sqlite.run(context.query);
    }catch(err) {
      //ToDo: What if constraint fails on plantClonedFrom?
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.genotypeId does not reference an existing Genotype');
      }
      throw err;
    }
    context.insertId = context.result.stmt.lastID;
    logger.debug(this.name, '#create() result:', context.result);
  }

  static buildReturnObject(returnObject, context, options) {
    returnObject['plants'] = {};

    returnObject.plants[context.insertId] = {
      'plantId': context.insertId,
      'plantName': options.plantName,
      'plantClonedFrom': options.plantClonedFrom || null,
      'plantSex': options.plantSex || null,
      'genotypeId': context.genotypeId
    }

    // if we created a new genotype we also want to have it in the returned
    // plant object.
    if(context.createdGenotype !== false) {
      returnObject.genotypes = context.createdGenotype.genotypes;
    }
  }
}

PlantCreate.table = CONSTANTS.TABLE_PLANTS;

module.exports = PlantCreate;
