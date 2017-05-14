'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const CONSTANTS = require('./constants');

let find = exports;

find = function find(model, options) {
  // parse options
  if(_.isNil(options)) options = {};
  let fields = options.fields || false;

  /*** BUILD QUERIES ***/
  /** INIT QUERIES **/
  let queryCore = squel.select().from(model.table, model.alias);

  // join
  _.each(model.join, function(toJoin) {
    if(toJoin == 'Family') {
      Utils.leftJoinFamilies(queryCore);
    } else if(toJoin == 'Generation') {
      Utils.leftJoinGenerations(queryCore);
    } else if(toJoin == 'GenerationParents') {
      queryWhere.left_join(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents', 'generations.generationId = generation_parents.generationId');
    } else if(toJoin == 'Genotye') {
      Utils.leftJoinGenotypes(queryCore);
    } else if(toJoin == 'Plant') {
      Utils.leftJoinPlants(queryCore);
    }
  });

  // setWhere
  Utils.setWhere(queryCore, model.allowedFields, options);

  let queryWhere, queryCount;
  queryWhere = queryCore;
  queryCount = queryCore.clone();




  let returnObject =


}
