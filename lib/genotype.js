'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Constants = require('./constants');

let Genotype = exports;

const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration, Constants.allowedFieldsGenotype);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration, Constants.fieldAliasesGenotype);
const validateFields = [
  ['genotypeId', 'int', false],
  ['genotypeName', 'string', false],
  ['generationId', 'int', true],
];

Genotype.create = async function create(options) {
  Utils.validateOptions(validateFields, options);

  let genotypeName = options.genotypeName || null;
  let generationId = options.generationId;
  let genotypeId;

  // Build query
  let q = squel
    .insert()
    .into(Constants.tableGenotypes)
    .set('genotypeId', null)
    .set('genotypeName', genotypeName)
    .set('generationId', generationId)
    .toString();

  logger.silly('Genotype #create() Query: ', q);

  let result;
  try {
    result = await sqlite.run(q);
  } catch(err) {
    // We only have one foreign key so we can safely assume, if a foreign key constraint
    // fails, it's the familyId constraint.
    if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
      throw new Error('options.generationId does not reference an existing Generation');
    } else {
      throw err;
    }
  }

  genotypeId = result.stmt.lastID;

  logger.debug('Genotype #create() Created new Genotype with ID:', genotypeId);

  let genotype = {
    'genotypes': {}
  }

  genotype.genotypes[genotypeId] = {
    'genotypeId': genotypeId,
    'genotypeName': genotypeName,
    'generationId': generationId
  }
  logger.debug('Genotype #create() Created new Genotype:', genotype);
  return genotype;
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
  let queryWhere = squel.select().from(Constants.tableGenotypes, 'genotypes');
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
