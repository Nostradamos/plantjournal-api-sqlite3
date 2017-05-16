'use strict';

const logger = require('./logger');
const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

const FamilyCreate = require('./family-create');
const FamilyFind = require('./family-find');

let Family = exports;

const allowedFields = CONSTANTS.FIELDS_FAMILY;
const fieldAliases = CONSTANTS.FIELD_ALIASES_FAMILY;

/**
 * Creates a new Family entry and returns the family object.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Family.create = async function(options) {
  return await FamilyCreate.create(options);
}

Family.get = async function(criteria) {
  return await FamilyFind.find(criteria);
}
