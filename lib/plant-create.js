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
    if(_.has(options, 'plantSex') && _.indexOf(CONSTANTS.allowedPlantSexes, options.plantSex) === -1) throw new Error('options.plantSex has to be null, male, female or hermaphrodite');

    context.genotypeId = options.genotypeId;
  }

  static buildQuery(context, options) {
    context.query
      .set('plantId', null)
      .set('plantName', options.plantName)
      .set('plantClonedFrom', options.plantClonedFrom)
      .set('plantSex', options.plantSex)
      .set('genotypeId', options.genotypeId);
  }

  static async createGenotypeOrResolveGenotypeId(context, options) {
    if(_.isUndefined(context.genotypeId) && _.isUndefined(options.plantClonedFrom)) {
      // If neither genotypeId nor plantClonedFrom is set, we want to create a new genotypeId
      // for this plant.
      let genotype = await Genotype.create(options);
      context.genotypeId = _.parseInt(_.keys(genotype.genotypes)[0]);
    }else if(!_.isUndefined(options.plantClonedFrom)) {
      
    }
  }

  static async executeQuery(context, options) {
    await this.createGenotypeOrResolveGenotypeId(context, options);
    try {
      await super.executeQuery(context, options);
    }catch(err) {
      //ToDo: What if constraint fails on plantClonedFrom?
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.generationId does not reference an existing Genotype');
      }
      throw err;
    }
  }

  static buildReturnObject(returnObject, context, options) {
    returnObject['plants'] = {};

    returnObject.plants[context.insertId] = {
      'plantId': context.insertId,
      'plantName': options.plantName,
      'plantClonedFrom': options.plantClonedFrom,
      'plantSex': options.plantSex,
      'genotypeId': context.genotypeId
    }

    // if we created a new genotype we also want to have it in the returned
    // plant object.
    if(genotype !== false) {
      plants.genotypes = genotype.genotypes;
    }
  }
}

PlantCreate.table = CONSTANTS.tablePlants;

module.exports = PlantCreate;
