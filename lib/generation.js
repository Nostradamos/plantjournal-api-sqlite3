'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');

let Generation = exports;

Generation.create = async function create(options) {
  if(_.isNil(options)) options = {};

  if(!_.has(options, 'familyId')) throw new Error('options.familyId is not set');
  if(!_.has(options, 'generationName')) throw new Error('options.generationName is not set');

  let familyId = options.familyId;
  let generationName = options.generationName;

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
      throw e;
    }
  }
  let generationId = result.stmt.lastID;

  // Create generation object
  let generation = {
    'generations': {}
  }

  generation.generations[generationId] = {
    'generationId': generationId,
    'generationName': generationName,
    'familyId': familyId
  }

  return generation;
}

Generation.get = async function(options){
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;
  let limit = options.limit || 10;
  let offset = options.offset || 0;

  // init query
  let q = squel.select().from('generations', 'generations').left_join('families', 'families', 'generations.familyId = families.familyId');

  // set fields
  if(fields === false || fields.indexOf('generationName') !== -1) q.field('generations.generationName');
  if(fields === false || fields.indexOf('familyName') !== -1) q.field('families.familyName');

  q.field('generations.generationId');
  q.field('families.familyId')

  let removeGenerationId = (fields !== false && fields.indexOf('generationId') === -1);
  logger.silly('removeGenerationId', removeGenerationId);

  let allowedFields = ['generationId', 'generationName', 'familyId', 'familyName'];
  // set where
  if(_.isPlainObject(options.where)) {
    await _.each(options.where, function(value, key) {
      if(_.indexOf(allowedFields, key) === -1) return;
      logger.silly('options.where key/value:', key, value);

      if(_.isInteger(value) || _.isString(value)) {
        let table;
        if(_.startsWith(key, 'generation')) {
          table = 'generations';
        } else {
          table = 'families';
        }
        q.where('?.? = ?', table, key, value);
      }
    });
  }

  // set limit && offset
  q.limit(limit).offset(offset);

  q = q.toString();
  logger.debug('Generation.create() Query:', q);

  // execute query
  let result;
  try {
    result = await sqlite.all(q);
  } catch(e) {
    throw e;
  }

  // build generations object
  let generations = {
    generations: {},
    families: {},
  };

  logger.silly('Generation #get() rows:', JSON.stringify(result));
  await _.each(result, function(row) {
    let generationId = row.generationId;
    let familyId = row.familyId;

    let generation = {
      'generationId': generationId,
      'familyId': familyId
    };

    if(_.has(row, 'generationName')) generation['generationName'] = row.generationName;

    if(!_.has(generations.families, familyId)) {
      let family = {
        'familyId': familyId
      }
      if(_.has(row, 'familyName')) {
        family['familyName'] = row.familyName;
        generations.families[familyId] = family;
      }
    }


    generations.generations[generationId] = generation;
  });

  Utils.deleteEmptyProperties(generations, ['families']);
  
  return generations;

}
