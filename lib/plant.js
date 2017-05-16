'use strict';


const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('./logger');
const Utils = require('./utils');
const Genotype = require('./genotype');
const CONSTANTS = require('./constants');

const PlantCreate = require('./plant-create');
const PlantFind = require('./plant-find');

let Plant = exports;

Plant.create = async function create(options) {
  return await PlantCreate.create(options);
}

Plant.get = async function get(criteria) {
  return await PlantFind.find(criteria);
}
