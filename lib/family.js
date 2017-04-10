'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');

let Family = exports;

/**
 * Creates a new Family entry and returns the family object.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */

Family.create = async function create(options) {
  // parse options
  if(!options) options = {};
  if(!options.familyName) throw new Error('Missing options.familyName');
  let familyName = options.familyName;

  // Build query
  let q = squel.insert().into('families');
  q.set('familyId', null);
  q = q.set('familyName', familyName).toString();

  // Execute query
  let result;
  try {
    result = await sqlite.run(q);
  } catch(e) {
    throw e;
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
  let limit = options.limit || 10;
  let offset = options.offset || 0;

  // init query
  let q = squel.select().from('families');

  // set fields
  if(fields === false || fields.indexOf('familyName') !== -1) q.field('familyName');

  // We always have to set familyId, because it's needed for the object key.
  q.field('familyId');

  let allowedFields = ['familyId', 'familyName'];


  // set where
  if(_.isPlainObject(options.where)) {
    logger.silly('_.isPlainObject(options.where) =>', _.isPlainObject(options.where));
    await _.each(options.where, function(value, key) {
      if(_.indexOf(allowedFields, key) === -1) return;
      logger.silly('options.where key/value:', key, value);

      if(_.isInteger(value) || _.isString(value)) {
        q.where('families.? = ?', key, value);
      }
    });
  }

  // familyId is a special case, if we don't have the familyId in our fields and fields !== false,
  // we later want to delete the familyId key from our familie objects.
  let removeFamilyId = (fields !== false && fields.indexOf('familyId') === -1);
  logger.silly('removeFamilyId', removeFamilyId);


  // set limit && offset
  q.limit(limit).offset(offset);

  q = q.toString();
  logger.debug('Query:', q);

  // execute query
  let result;
  try {
    result = await sqlite.all(q);
  } catch(e) {
    throw e;
  }



  // build families object
  let families = {
    families: {}
  };

  await _.each(result, function(fam) {
    let familyId = fam.familyId;
    // Let's remove this familyId
    if(removeFamilyId === true) {
      delete fam.familyId;
    }
    families.families[familyId] = fam;
  });

  return families;

}

Family.test = function test() {
  console.log(sqlite);
}
