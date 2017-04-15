'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Phenotype = require('./phenotype');
const Constants = require('./constants');

let Plant = exports;

// CONSTANTS
const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration, Constants.allowedFieldsPhenotype, Constants.allowedFieldsPlant);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration, Constants.fieldAliasesPhenotype, Constants.fieldAliasesPlant);

Plant.create = async function create(options) {
  logger.silly('Plant #create() Options:', options);

  // Init variables we need
  if(_.isNil(options)) options = {};

  let generationId = options.generationId;
  let phenotypeId = options.phenotypeId;
  let plantName = options.plantName;

  // Now make sure our paramaters are valid

  // Either generationId or phenotypeId has to be set.
  if(_.isUndefined(generationId) && _.isUndefined(phenotypeId)) throw new Error('Either options.generationId or options.phenotypeId has to be set');

  // And if set, it has to be an integer
  if(!_.isUndefined(generationId) && !_.isInteger(generationId)) throw new Error('options.generationId has to be an integer');
  if(!_.isUndefined(phenotypeId) && !_.isInteger(phenotypeId)) throw new Error('options.phenotypeId has to be an integer');


  // plantName has to be set
  if(_.isUndefined(plantName)) throw new Error('options.plantName has to be set');
  if(!_.isString(plantName)) throw new Error('options.plantName has to be a string');

  // paramaters look fine, let's go!

  // If generationId is set, and phenotypeId is not set, we want to create
  // a new phenotype.
  let phenotype = false;
  if(!_.isUndefined(generationId) && _.isUndefined(phenotypeId)) {
    phenotype = await Phenotype.create(options);
    phenotypeId = _.parseInt(_.keys(phenotype.phenotypes)[0]);
  }

  // Build query
  let q = squel.insert().into(Constants.tablePlants);
  q.set('plantId', null);
  q.set('plantName', plantName);
  q.set('phenotypeId', phenotypeId);

  q = q.toString();

  logger.silly('Plant #create() Query: ', q);

  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    // We only have one foreign key so we can safely assume, if a foreign key constraint
    // fails, it's the phenotypeId constraint.
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
      throw new Error('options.phenotypeId does not reference an existing Phenotype');
    } else {
      logger.error('Plant #create() Unknown Error on sqlite.run(): ', err);
      throw err;
    }
  }

  let plantId =  result.stmt.lastID;

  let plants = {'plants': {}};

  plants.plants[plantId] = {
    'plantId': plantId,
    'phenotypeId': phenotypeId,
    'plantName': plantName
  }

  // if we created a new phenotype we also want to have it in the returned
  // plant object.
  if(phenotype !== false) {
    plants.phenotypes = phenotype.phenotypes;
  }

  return plants;
}

Plant.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;

  // init query
  let q = squel.select().from(Constants.tablePlants, 'plants');
  Utils.leftJoinPhenotypes(q);
  Utils.leftJoinGenerations(q);
  Utils.leftJoinFamilies(q);
  q.group('plants.plantId');

  // set fields
  Utils.setFields(q, fieldAliases, fields);

  // We always want the ids
  q.fields(['plants.plantId', 'phenotypes.phenotypeId', 'generations.generationId', 'families.familyId']);

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
    phenotypes: {},
    generations: {},
    families: {}
  };

  logger.silly('Plant #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, plants, options);
    Utils.addGenerationFromRowToReturnObject(row, plants, options);
    Utils.addPhenotypeFromRowToReturnObject(row, plants, options);
    Utils.addPlantFromRowToReturnObject(row, plants, options, true);
  });

  Utils.deleteEmptyProperties(plants, ['families', 'generations', 'phenotypes']);

  return plants;
}
