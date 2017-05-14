'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const CONSTANTS = require('./constants');
const GenotypeCreate = require('./genotype-create');

let Genotype = exports;

const allowedFields = _.concat(CONSTANTS.FIELDS_FAMILY, CONSTANTS.FIELDS_GENERATION, CONSTANTS.FIELDS_GENOTYPE);
const fieldAliases = _.merge({}, CONSTANTS.FIELD_ALIASES_FAMILY, CONSTANTS.FIELD_ALIASES_GENERATION, CONSTANTS.FIELD_ALIASES_GENOTYPE);
const validateFields = [
  ['genotypeId', 'int', false],
  ['genotypeName', 'string', false],
  ['generationId', 'int', true],
];

Genotype.create = async function create(options) {
  return await GenotypeCreate.create(options);
}

Genotype.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;

  // Init queries, we need two query objects, because we need a subquery which
  // counts the total rows we could get for this query. Basically the counting
  // query ignores the limit part and uses the COUNT() function in sqlite.
  // To make it easier we first set everything which is the same for both queries
  // to queryWhere and clone it into queryCount. So we have to do things only once.
  let queryWhere = squel.select().from(CONSTANTS.TABLE_GENOTYPES, 'genotypes');
  let queryCount;

  Utils.leftJoinGenerations(queryWhere);
  Utils.leftJoinFamilies(queryWhere);

  // set where
  Utils.setWhere(queryWhere, allowedFields, options);

  // now clone queryWhere into queryCount and set count field
  queryCount = queryWhere.clone().field('count(DISTINCT genotypes.genotypeId)', 'count');

  // set fields
  logger.debug('Genotype #get() allowedFields:', Genotype.allowedFields);
  logger.debug('Genotype #get() fieldAliases:', Genotype.fieldAliases);
  Utils.setFields(queryWhere, fieldAliases, fields);
  // We always want the ids
  queryWhere.fields(['genotypes.genotypeId', 'generations.generationId', 'families.familyId']);

  // set limit && offset
  Utils.setLimitAndOffset(queryWhere, options);

  // set group
  queryWhere.group('genotypes.genotypeId');

  // Stringify queries
  queryWhere = queryWhere.toString();
  queryCount = queryCount.toString();
  logger.debug('Genotype #get() queryWhere:', queryWhere);
  logger.debug('Genotype #get() queryCount:', queryCount);


  // execute query
  let rows, count;
  try {
    [rows, count] = await Promise.all([sqlite.all(queryWhere), sqlite.get(queryCount)]);
  } catch(err) {
    throw err;
  }

  // build generations object
  let genotypes = {
    genotypes: {},
    generations: {},
    families: {}
  };

  logger.silly('Genotype #get() rows:', JSON.stringify(rows));
  logger.silly('Genotype #get() count:', JSON.stringify(count));
  _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, genotypes, options);
    Utils.addGenerationFromRowToReturnObject(row, genotypes, options);
    Utils.addGenotypeFromRowToReturnObject(row, genotypes, options, true);
  });

  logger.debug('Family #get() lenRows:', rows.length);
  Utils.addFoundAndRemainingFromCountToReturnObject(count, rows.length, genotypes, options);

  Utils.deleteEmptyProperties(genotypes, ['families', 'generations']);

  return genotypes;

}
