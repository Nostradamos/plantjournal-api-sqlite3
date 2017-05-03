'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Constants = require('./constants');

let Family = exports;

const allowedFields = Constants.allowedFieldsFamily;
const fieldAliases = Constants.fieldAliasesFamily;

/**
 * Creates a new Family entry and returns the family object.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

Family.create = async function create(options) {
  // parse options
  logger.debug('Family #create() options:', options);
  if(!_.isObjectLike(options) || _.isArray(options)) throw new Error('First argument has to be an associative array');
  if(!options.familyName) throw new Error('options.familyName has to be set');
  if(!_.isString(options.familyName)) throw new Error('options.familyName has to be a string');

  let familyName = options.familyName;

  // Build queryWher
  let queryWhere = squel.insert().into(Constants.tableFamilies);
  queryWhere.set('familyId', null);
  queryWhere = queryWhere.set('familyName', familyName).toString();

  logger.debug('Family #create() queryWhereuery:', queryWhere);
  // Execute queryWhereuery
  let result;
  try {
    result = await sqlite.run(queryWhere);
  } catch(err) {
    logger.error('Family #create() Unknown Error:', err);
    throw err;
  }
  let familyId = result.stmt.lastID;


  let families = {
    'families': {}
  }

  families.families[familyId] = {
    'familyId': familyId,
    'familyName': familyName
  }

  return families;
}

Family.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};
  let fields = options.fields || false;

  // INIT queries
  let queryWhere = squel.select().from(Constants.tableFamilies);
  // init it now, clone it from queryWhere later. Where stuff will be
  // the same for both.
  let queryCount;

  // First set the WHERE stuff for our query
  Utils.setWhere(queryWhere, allowedFields, options);

  // Now clone queryWhere into queryCount so we don't have to do things twice
  queryCount = queryWhere.clone();

  // FIELD
  // We always have to set familyId, because it's needed for the object key.
  queryWhere.field('familyId');
  // We only have to set fields specified if options.fields, otherwise all.
  Utils.setFields(queryWhere, fieldAliases, options.fields);

  // For queryCount we only need to count familyIds
  queryCount.field('count(familyId)', 'count');

  // Set LIMIT and OFFSET for queryWhere (and only for queryWhere)
  Utils.setLimitAndOffset(queryWhere, options);

  // Stringify queries
  queryWhere = queryWhere.toString(); // make queryWhereuery a string
  queryCount = queryCount.toString();
  logger.debug('queryWhere:', queryWhere);

  // execute queries
  let rows;
  let count;
  try {
    [rows, count] = await Promise.all([sqlite.all(queryWhere), sqlite.get(queryCount)]);
  } catch(err) {
    logger.error('Family #get() Unknown Error:', err);
    throw err;
  }

  logger.debug('Family #get() rows:', rows);
  logger.debug('Family #get() count:', count);

  // build families object
  let families = {'families': {}};

  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, families, options, true);
  });

  logger.debug('Family #get() lenRows:', rows.length);
  Utils.addFoundAndRemainingFromCountToReturnObject(count, rows.length, families, options);

  return families;
}
