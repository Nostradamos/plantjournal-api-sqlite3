'use strict';


const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('./logger');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

const GenotypeCreate = require('./genotype-create');
const GenotypeFind = require('./genotype-find');

let Genotype = exports;


Genotype.create = async function create(options) {
  return await GenotypeCreate.create(options);
}

Genotype.get = async function get(criteria) {
  return await GenotypeFind.find(criteria);
}
