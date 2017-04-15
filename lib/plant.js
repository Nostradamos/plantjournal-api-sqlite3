'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Genotype = require('./genotype');
const Constants = require('./constants');

let Plant = exports;

// CONSTANTS
const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration, Constants.allowedFieldsGenotype, Constants.allowedFieldsPlant);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration, Constants.fieldAliasesGenotype, Constants.fieldAliasesPlant);

Plant.create = async function create(options) {
  logger.silly('Plant #create() Options:', options);

  // Init variables we need
  if(_.isNil(options)) options = {};

  let generationId = options.generationId;
  let genotypeId = options.genotypeId;
  let plantName = options.plantName;
  let plantClonedFrom = options.plantClonedFrom || null;
  let plantSex = options.plantSex || null;

  // Now make sure our paramaters are valid

  // Either generationId or genotypeId has to be set.
  if(_.isUndefined(generationId) && _.isUndefined(genotypeId) && _.isNull(plantClonedFrom)) throw new Error('Either options.generationId, options.genotypeId or options.plantClonedFrom has to be set');

  // And if set, it has to be an integer
  if(!_.isUndefined(generationId) && !_.isInteger(generationId)) throw new Error('options.generationId has to be an integer');
  if(!_.isUndefined(genotypeId) && !_.isInteger(genotypeId)) throw new Error('options.genotypeId has to be an integer');
  if(!_.isNull(plantClonedFrom) && !_.isInteger(plantClonedFrom)) throw new Error('options.plantClonedFrom has to be an integer');

  // plantName has to be set
  if(_.isUndefined(plantName)) throw new Error('options.plantName has to be set');
  if(!_.isString(plantName)) throw new Error('options.plantName has to be a string');

  // plantSex has to be either male, female or hermaphrodite
  if(_.indexOf(Constants.allowedPlantSexes, plantSex) === -1) throw new Error('options.plantSex has to be null, male, female or hermaphrodite');

  // paramaters look fine, let's go!

  // If generationId is set, and genotypeId is not set, and plantClonedFrom is null,
  // we want to create a new genotype.
  let genotype = false;
  if(!_.isUndefined(generationId) && _.isUndefined(genotypeId) && _.isNull(plantClonedFrom)) {
    genotype = await Genotype.create(options);
    genotypeId = _.parseInt(_.keys(genotype.genotypes)[0]);
  }else if(!_.isNull(plantClonedFrom)) {
    // plantClonedFrom is not null, resolve genotypeId.
    logger.debug('Plant #create() We need to resolve the genotypeId from Mother Plant with id:', plantClonedFrom);
    let qMotherPlant = squel.select().from(Constants.tablePlants, 'plants').field(Constants.idFieldGenotype).where('plants.plantId = ?', plantClonedFrom).limit(1).toString();
    logger.debug('Plant #create() Resolve Mother Plant Genotype Id Query:', qMotherPlant);
    let row;
    try {
      row = await sqlite.get(qMotherPlant);
    } catch (err) {
      logger.error('Plant #create() Unknown Error on sqlite.run(): ', err);
      throw err;
    }
    // No row == no such plant
    if(_.isUndefined(row)) throw new Error('options.plantClonedFrom does not reference an existing Plant');
    genotypeId = row.genotypeId;
    logger.debug('Plant #create() Resolved genotype id of mother plant:', genotypeId);
  }

  // Build query
  let q = squel.insert().into(Constants.tablePlants);
  q.set('plantId', null);
  q.set('plantName', plantName);
  q.set('plantClonedFrom', plantClonedFrom);
  q.set('plantSex', plantSex);
  q.set('genotypeId', genotypeId);

  q = q.toString();

  logger.silly('Plant #create() Query: ', q);

  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    // We only have one foreign key so we can safely assume, if a foreign key constraint
    // fails, it's the genotypeId constraint.
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
      throw new Error('options.genotypeId does not reference an existing Genotype');
    } else {
      logger.error('Plant #create() Unknown Error on sqlite.run(): ', err);
      throw err;
    }
  }

  let plantId =  result.stmt.lastID;

  let plants = {'plants': {}};

  plants.plants[plantId] = {
    'plantId': plantId,
    'plantName': plantName,
    'plantClonedFrom': plantClonedFrom,
    'plantSex': plantSex,
    'genotypeId': genotypeId
  }

  // if we created a new genotype we also want to have it in the returned
  // plant object.
  if(genotype !== false) {
    plants.genotypes = genotype.genotypes;
  }

  return plants;
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
