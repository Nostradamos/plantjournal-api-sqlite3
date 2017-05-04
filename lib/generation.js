'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Constants = require('./constants');

let Generation = exports;

const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration);


Generation.create = async function create(options) {

  logger.debug('Generation #create() options:', options);
  if(!_.isObjectLike(options) || _.isArray(options)) throw new Error('First argument has to be an associative array');
  if(!_.has(options, 'familyId')) throw new Error('options.familyId is not set');
  if(!_.isInteger(options.familyId)) throw new Error('options.familyId has to be an integer');
  if(!_.has(options, 'generationName')) throw new Error('options.generationName is not set');
  if(!_.isString(options.generationName)) throw new Error('options.generationName has to be a string');
  // options.generationParents is optional, but if we have, it has to be an array
  if(_.has(options, 'generationParents') && !_.isArray(options.generationParents)) throw new Error('options.generationParents has to be an array');

  let familyId = options.familyId;
  let generationName = options.generationName;
  let generationParents = options.generationParents || [];

  // Build query
  let q = squel.insert().into(Constants.tableGenerations);
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
  if(generationParents.length > 0) {
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

  /*** BUILD QUERIES ***/
  /** INIT QUERIES **/
  let queryWhere = squel.select().from(Constants.tableGenerations, 'generations');
  let queryCount; // we later clone into this

  /** JOINS **/
  // We can't use Utils.leftJoinGenerations because we only want to join generation_parents
  queryWhere.left_join(Constants.tableGenerationParents, 'generation_parents', 'generations.generationId = generation_parents.generationId');
  Utils.leftJoinFamilies(queryWhere);

  /** WHERE **/
  Utils.setWhere(queryWhere, allowedFields, options);
  // this was the last step which was the same for queryWhere & queryCount,
  // now clone
  queryCount = queryWhere.clone();

  /** SET FIELDS **/
  Utils.setFields(queryWhere, fieldAliases, options.fields);
  // default fields
  queryWhere.fields(['generations.generationId', 'families.familyId']);
  queryCount.field('count(DISTINCT generations.generationId)', 'count');

  // ToDo: delete
  let removeGenerationId = (fields !== false && fields.indexOf('generationId') === -1);
  logger.silly('removeGenerationId', removeGenerationId);


  /** LIMIT & OFFSET **/
  Utils.setLimitAndOffset(queryWhere, options);

  /** GROUP **/
  queryWhere.group('generations.generationId');

  // Stringify queries
  queryWhere = queryWhere.toString();
  queryCount = queryCount.toString();

  logger.debug('Generation #get() queryWhere:', queryWhere);
  logger.debug('Generation #get() queryCount:', queryCount);


  // execute both queries to fetch all querie results
  let rows, count;
  try {
    [rows, count] = await Promise.all([sqlite.all(queryWhere), sqlite.get(queryCount)]);
  } catch(err) {
    throw err;
  }

  logger.debug('Generation #get() rows:', rows);
  logger.debug('Generation #get() count:', count);

  // build generations object
  let generations = {generations: {}, families: {}};

  logger.silly('Generation #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, generations, options);
    Utils.addGenerationFromRowToReturnObject(row, generations, options);
  });

  Utils.addFoundAndRemainingFromCountToReturnObject(count, rows.length, generations, options);

  // We could use Utils.deleteEmptyProperties() but this is maybe more performant.
  if(_.isEmpty(generations.families)) delete generations.families;

  return generations;
}
