'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Genotype = require('./genotype');
const Constants = require('./constants');
const PlantCreate = require('./plant-create');

let Plant = exports;

// CONSTANTS
const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration, Constants.allowedFieldsGenotype, Constants.allowedFieldsPlant);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration, Constants.fieldAliasesGenotype, Constants.fieldAliasesPlant);

Plant.create = async function create(options) {
  return await PlantCreate.create(options);
}

Plant.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;

  // init query
  let q = squel.select().from(Constants.tablePlants, 'plants');
  Utils.leftJoinGenotypes(q);
  Utils.leftJoinGenerations(q);
  Utils.leftJoinFamilies(q);
  q.group('plants.plantId');

  // set fields
  Utils.setFields(q, fieldAliases, fields);

  // We always want the ids
  q.fields(['plants.plantId', 'genotypes.genotypeId', 'generations.generationId', 'families.familyId']);

  // set where
  Utils.setWhere(q, allowedFields, options);

  // set limit && offset
  Utils.setLimitAndOffset(q, options);

  q = q.toString();
  logger.debug('Plant #get() Query:', q);

  // execute query
  let rows;
  try {
    rows = await sqlite.all(q);
  } catch(err) {
    throw err;
  }

  // init return object
  let plants = {
    plants: {},
    genotypes: {},
    generations: {},
    families: {}
  };

  logger.silly('Plant #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, plants, options);
    Utils.addGenerationFromRowToReturnObject(row, plants, options);
    Utils.addGenotypeFromRowToReturnObject(row, plants, options);
    Utils.addPlantFromRowToReturnObject(row, plants, options, true);
  });

  Utils.deleteEmptyProperties(plants, ['families', 'generations', 'genotypes']);

  return plants;
}
