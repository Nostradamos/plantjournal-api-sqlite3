'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('./logger');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

const GenerationCreate = require('./generation-create');
const GenerationFind = require('./generation-find');

let Generation = exports;

Generation.create = async function create(options) {
  return await GenerationCreate.create(options);
}

Generation.get = async function get(criteria) {
  return await GenerationFind.find(criteria);
}
