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

Genotype.create = async function create(options) {
  if(!_.isObjectLike(options) || _.isArray(options)) throw new Error('First argument has to be an associative array');
  if(!_.has(options, 'generationId')) throw new Error('options.generationId is not set');
  if(!_.isInteger(options.generationId)) throw new Error('options.generationId has to be an integer');
  if(_.has(options, 'genotypeName') && !_.isString(options.genotypeName)) throw new Error('options.genotypeName has to be a string');

  let genotypeName = options.genotypeName || null;
  let generationId = options.generationId;

  // Build query
  let q = squel.insert().into(Constants.tableGenotypes);
  q.set('genotypeId', null);
  q.set('genotypeName', genotypeName);
  q.set('generationId', generationId);

  q = q.toString();

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
  let genotypeId = result.stmt.lastID;

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

  // init query
  let q = squel.select().from(Constants.tableGenotypes, 'genotypes');
  Utils.leftJoinGenerations(q);
  Utils.leftJoinFamilies(q);
  q.group('genotypes.genotypeId');

  // set fields
  logger.debug('Genotype #get() allowedFields:', Genotype.allowedFields);
  logger.debug('Genotype #get() fieldAliases:', Genotype.fieldAliases);
  Utils.setFields(q, fieldAliases, fields);

  // We always want the ids
  q.fields(['genotypes.genotypeId', 'generations.generationId', 'families.familyId']);


  // set where
  Utils.setWhere(q, allowedFields, options);

  // set limit && offset
  Utils.setLimitAndOffset(q, options);

  q = q.toString();
  logger.debug('Genotype #get() Query:', q);

  // execute query
  let rows;
  try {
    rows = await sqlite.all(q);
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
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, genotypes, options);
    Utils.addGenerationFromRowToReturnObject(row, genotypes, options);
    Utils.addGenotypeFromRowToReturnObject(row, genotypes, options, true);
  });

  Utils.deleteEmptyProperties(genotypes, ['families', 'generations']);

  return genotypes;

}
