'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

const GenerationCreate = require('./generation-create');

let Generation = exports;

const allowedFields = _.concat(CONSTANTS.allowedFieldsFamily, CONSTANTS.allowedFieldsGeneration);
const fieldAliases = _.merge({}, CONSTANTS.fieldAliasesFamily, CONSTANTS.fieldAliasesGeneration);


Generation.create = async function create(options) {
  return await GenerationCreate.create(options);
}

Generation.get = async function(options){
  // parse options
  if(_.isNil(options)) options = {};
  let fields = options.fields || false;

  /*** BUILD QUERIES ***/
  /** INIT QUERIES **/
  let queryWhere = squel.select().from(CONSTANTS.TABLE_GENERATIONS, 'generations');
  let queryCount; // we later clone into this

  /** JOINS **/
  // We can't use Utils.leftJoinGenerations because we only want to join generation_parents
  queryWhere.left_join(CONSTANTS.tableGenerationParents, 'generation_parents', 'generations.generationId = generation_parents.generationId');
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
