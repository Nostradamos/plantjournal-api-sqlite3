'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('./constants');
const logger = require('./logger');
const Utils = require('./utils');

/**
 * Set of utils mainly used for query building.
 * @namespace QueryUtils
 */
let QueryUtils = exports;


/**
 * Join all Related Tables to Generations. With the joinGenerationParents flag
 * you can set if we want to join GenerationParents too or not.
 * Mutates queryObj.
 *
 * @param {squel} queryObj                       - Squel Query Builder to add joins
 * @param {boolean} [joinGenerationParents=true] - True if we want to join generationParents
 */
QueryUtils.joinRelatedGenerations = function(queryObj, joinGenerationParents = true) {
  if(joinGenerationParents == true) {
    Utils.leftJoinGenerationParentsOnly(queryObj);
  }
  Utils.leftJoinFamilies(queryObj);
}


/**
 * Join all realted tables to Genotypes.
 * This will also execute QueryUtils.joinRelatedGenerations(queryObj).
 * Mutates queryObj.
 *
 * @param {squel} queryObj - Squel Query Builder to add joins
 * @returns {undefined}
 */
QueryUtils.joinRelatedGenotypes = function(queryObj) {
  Utils.leftJoinGenerations(queryObj);

  // Because with Utils.leftJoinGenerations we already join
  // generation_parents and generations, we don't have to join
  // generation_parents again, therefore set false
  QueryUtils.joinRelatedGenerations(queryObj, false);
}


/**
 * Joins all related tables of Plant. So joins all genotypes, joins all related
 * tables of genotype (which joins generations, which joins all related tables
 * of generation...)
 * Mutates queryObj.
 *
 * @param {squel} queryObj - Squel Query Builder to add joins
 * @returns {undefined}
 */
QueryUtils.joinRelatedPlants = function(queryObj) {
  Utils.leftJoinGenotypes(queryObj);
  QueryUtils.joinRelatedGenotypes(queryObj);
}
