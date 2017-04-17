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

  // Build query
  let q = squel.insert().into(Constants.tableFamilies);
  q.set('familyId', null);
  q = q.set('familyName', familyName).toString();

  logger.debug('Family #create() query:', q);
  // Execute query
  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    logger.error('Family #create() Unknown Error:', err);
    throw err;
  }
  let familyId = result.stmt.lastID;

  // Return family object

  // okay, this looks a bit weird, but our return objects are always in this
  // format:
  // {
  //  families: {
  //   1: {
  //     familyId: 1,
  //     familyName: 'blubb'
  //   }
  //  }
  // }

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

  // init query
  let q = squel.select().from(Constants.tableFamilies);

  // set fields
  // We could use Utils.setFields, but this is maybe faster
  Utils.setFields(q, fieldAliases, options.fields);

  // We always have to set familyId, because it's needed for the object key.
  q.field('familyId');

  // set where
  Utils.setWhere(q, allowedFields, options);

  // set limit && offset
  Utils.setLimitAndOffset(q, options);

  q = q.toString(); // make query a string
  logger.debug('Query:', q);

  // execute query
  let rows;
  try {
    rows = await sqlite.all(q);
  } catch(err) {
    logger.error('Family #get() Unknown Error:', err);
    throw err;
  }

  // build families object
  let families = {'families': {}};

  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, families, options, true);
  });

  return families;
}
