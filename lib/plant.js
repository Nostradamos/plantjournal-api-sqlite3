'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Phenotype = require('./phenotype');

let Plant = exports;

Plant.create = async function create(options) {
  if(_.isNil(options)) options = {};

  let generationId = options.generationId;
  let phenotypeId = options.phenotypeId;
  let plantName = options.plantName;

  logger.silly('Plant #create() Options:', options);

  // Either generationId or phenotypeId has to be set.
  if(_.isUndefined(generationId) && _.isUndefined(phenotypeId)) throw new Error('Either options.generationId or options.phenotypeId has to be set');

  // And if set, it has to be an integer
  if(!_.isUndefined(generationId) && !_.isInteger(generationId)) throw new Error('options.generationId has to be an integer');
  if(!_.isUndefined(phenotypeId) && !_.isInteger(phenotypeId)) throw new Error('options.phenotypeId has to be an integer');


  // plantName has to be set
  if(_.isUndefined(plantName)) {  logger.silly('Plant #create() plantName:', plantName, _.isUndefined(plantName));
 throw new Error('options.plantName has to be set'); }
  if(!_.isString(plantName)) { throw new Error('options.plantName has to be a string'); }


  // If generationId is set, and phenotypeId is not set, we want to create
  // a new phenotype.
  let phenotype = false;
  if(_.has(options, 'generationId') && !_.has(options, 'phenotypeId')) {
    phenotype = await Phenotype.create(options);
    // ToDo: What if options.generationId and phenotype.generationId are not
    // the same?
    phenotypeId = phenotype.phenotypeId;
  }

  // Build query
  let q = squel.insert().into('plants');
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
    // fails, it's the familyId constraint.
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
      throw new Error('options.phenotypeId does not reference an existing Phenotype');
    } else {
      logger.error('Plant #create() Unknown Error on sqlite.run(): ', err);
      throw err;
    }
  }

}
