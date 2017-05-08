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
  // Check if options are valid, otherwise throw error
  logger.debug('Family #create() options:', options);
  if(!_.isObjectLike(options) || _.isArray(options)) throw new Error('First argument has to be an associative array');
  if(!options.familyName) throw new Error('options.familyName has to be set');
  if(!_.isString(options.familyName)) throw new Error('options.familyName has to be a string');

  let familyId;
  let familyName = options.familyName;

  // Build query
  let q = squel
    .insert()
    .into(Constants.tableFamilies)
    .set('familyId', null)
    .set('familyName', familyName)
    .toString();

  logger.debug('Family #create() query:', q);

  // Now we will execute the query and catch errors
  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    logger.error('Family #create() Unknown Error:', err);
    throw err;
  }

  familyId = result.stmt.lastID; // get the inserted id

  let families = {'families': {}}; // this will be our return object

  families.families[familyId] = {
    'familyId': familyId,
    'familyName': familyName
  }

  return families;
}

Family.get = async function get(options) {
  // Get everything we need from options object
  if(_.isNil(options)) options = {};
  let fields = options.fields || false;

  // Init queries, we need two query objects, because we need a subquery which
  // counts the total rows we could get for this query. Basically the counting
  // query ignores the limit part and uses the COUNT() function in sqlite.
  // To make it easier we first set everything which is the same for both queries
  // to queryWhere and clone it into queryCount. So we have to do things only once.
  let queryWhere = squel.select().from(Constants.tableFamilies);
  let queryCount;

  // First set the WHERE stuff for our query
  Utils.setWhere(queryWhere, allowedFields, options);

  // Now clone queryWhere into queryCount so we don't have to do things twice
  // and set the count field.
  queryCount = queryWhere.clone().field('count(familyId)', 'count');

  // For queryWhere we always have to set familyId, because it's needed
  // for the object key.
  queryWhere.field('familyId');
  // We only have to set fields specified if options.fields, otherwise all.
  Utils.setFields(queryWhere, fieldAliases, options.fields);

  // Set LIMIT and OFFSET for queryWhere (and only for queryWhere)
  Utils.setLimitAndOffset(queryWhere, options);

  // Stringify queries
  queryWhere = queryWhere.toString(); // make queryWhereuery a string
  queryCount = queryCount.toString();
  logger.debug('queryWhere:', queryWhere);

  // Now we will execute both queries and catch the results
  let rows, count;
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

  _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, families, options, true);
  });

  logger.debug('Family #get() lenRows:', rows.length);
  Utils.addFoundAndRemainingFromCountToReturnObject(count, rows.length, families, options);

  return families;
}
