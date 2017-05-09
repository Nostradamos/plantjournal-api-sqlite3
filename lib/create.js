'use strict';

const logger = require('./logger');
const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Constants = require('./constants');

let Create = exports;

Create.createLogic = async function createLogic(model, options) {
  logger.debug(model.name + ' #create() options:', options);

  // Validate fields
  if(!_.isObjectLike(options) || _.isArray(options)) {
    throw new Error('First argument has to be an associative array');
  }

  // Init INSERT query
  let q = squel.insert().into(model.table);
  let innerReturnObject = {}

  // Validate fields and add them to query if they are fine
  _.each(model.fields, function(field) {
    let [fieldName, fieldType, required] = [field[0], field[1], field[2]];

    if(_.has(options, fieldName)) {
      if(fieldType === 'int' && !_.isInteger(options[fieldName])) {
        throw new Error('options.' + fieldName + ' has to be an integer');
      } else if(fieldType === 'string' && !_.isString(options[fieldName])) {
        throw new Error('options.' + fieldName + ' has to be a string');
      } else if(fieldType === 'int[]' && (!_.isArray(arr) || !_.every(arr, _.isInteger))) {
        throw new Error('options.' + fieldName + ' has to be an array of integers');
      }
    } else if(required === true) {
      // We don't have this field, but it's required, so throw an error
      throw new Error('options.' + fieldName + ' has to be set');
    } else {
      // we don't have this field, so we can safely return
      return;
    }

    // field is valid, now we can this field to our insert query
    q.set(fieldName, options[fieldName]);
    // we also add this field now to our returnObject so we don't have to
    // iterate twice over the model.fields array
    innerReturnObject[fieldName] = options[fieldName];
  });

  q = q.toString(); // Stringify query

  logger.debug(model.name + ' #create() query:', q);

  // Now we will execute the query and catch errors
  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {

    } else {
      logger.error(model.name + ' #create() Unknown Error:', err);
      throw err;
    }
  }

  let insertId = result.stmt.lastID;
  innerReturnObject[model.idField] = insertId;
  let returnObject = {};
  returnObject[model.plural] = {};
  returnObject[model.plural][insertId] = innerReturnObject;
  console.log(returnObject);
  return returnObject;

}
