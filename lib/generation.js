'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');

let Generation = exports;

Generation.create = async function create(options) {
  if(_.isNil(options)) options = {};

  logger.debug('Generation #create() options:', options);

  if(!_.has(options, 'familyId')) throw new Error('options.familyId is not set');
  if(!_.has(options, 'generationName')) throw new Error('options.generationName is not set');

  let familyId = options.familyId;
  let generationName = options.generationName;
  let generationParents = options.generationParents;

  // Build query
  let q = squel.insert().into('generations');
  q.set('familyId', familyId);
  q.set('generationId', null);
  q.set('generationName', generationName);
  q = q.toString();

  logger.silly('Generation.create Query: ', q);

  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    // We only have one foreign key so we can safely assume, if a foreign key constraint
    // fails, it's the familyId constraint.
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
      throw new Error('options.familyId does not reference an existing Family');
    } else {
      throw err;
    }
  }
  let generationId = result.stmt.lastID;

  // If options.generationParents is an array, we have to insert some more entries into generationParents table
  if(_.isArray(generationParents)) {
    logger.debug('Generation #create() We need to add generationParents:', options.generationParents);
    let qParents = squel.insert().into('generation_parents');
    let fieldsRows = [];
    _.each(generationParents, function(parentPlantId) {
      fieldsRows.push({parentId: null, generationId: generationId, plantId: parentPlantId});
    });
    qParents.setFieldsRows(fieldsRows);

    qParents = qParents.toString();
    logger.debug('Generation #create() Insert Parents Query:', qParents);

    let resultParents;

    try {
      result = await sqlite.run(qParents);
    } catch(err) {
      throw err;
    }
    logger.debug('Generation #create() Parents sql result:', JSON.stringify(result));
  } else {
    generationParents = [];
  }

  // Create generation object
  let generation = {
    'generations': {}
  }

  generation.generations[generationId] = {
    'generationId': generationId,
    'generationName': generationName,
    'generationParents': generationParents,
    'familyId': familyId,
  }

  return generation;
}

Generation.get = async function(options){
  // parse options
  if(_.isNil(options)) options = {};
  let fields = options.fields || false;

  // init query
  let q = squel.select().from('generations', 'generations');
  q.left_join('families', 'families', 'generations.familyId = families.familyId');
  q.left_join('generation_parents', 'generation_parents', 'generations.generationId = generation_parents.generationId');
  q.group('generations.generationId');
  // set fields
  Utils.setFields(q, {'generationName': 'generations.generationName', 'generationParents':  'group_concat(generation_parents.plantId) as generationParents', 'familyName': 'families.familyName'}, options.fields);

  q.fields(['generations.generationId', 'families.familyId']);


  let removeGenerationId = (fields !== false && fields.indexOf('generationId') === -1);
  logger.silly('removeGenerationId', removeGenerationId);

  // set where
  let allowedFields = ['generationId', 'generationName', 'generationParents', 'familyId', 'familyName'];
  Utils.setWhere(q, allowedFields, options);

  // set limit && offset
  Utils.setLimitAndOffset(q, options);

  q = q.toString();
  logger.debug('Generation.create() Query:', q);

  // execute query to insert into generations table
  let rows;
  try {
    rows = await sqlite.all(q);
  } catch(err) {
    throw err;
  }

  // build generations object
  let generations = {
    generations: {},
    families: {},
  };

  logger.silly('Generation #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, generations, options);
    Utils.addGenerationFromRowToReturnObject(row, generations, options);
  });

  // We could use Utils.deleteEmptyProperties() but this is maybe more performant.
  if(_.isEmpty(generations.families)) delete generations.families;

  return generations;

}
