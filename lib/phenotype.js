'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');
const Constants = require('./constants');

let Phenotype = exports;

const allowedFields = _.concat(Constants.allowedFieldsFamily, Constants.allowedFieldsGeneration, Constants.allowedFieldsPhenotype);
const fieldAliases = _.merge({}, Constants.fieldAliasesFamily, Constants.fieldAliasesGeneration, Constants.fieldAliasesPhenotype);

Phenotype.create = async function create(options) {
  if(_.isNil(options)) options = {};

  if(!_.has(options, 'generationId')) throw new Error('options.generationId is not set');

  let phenotypeName = options.phenotypeName || null;
  let generationId = options.generationId;

  // Build query
  let q = squel.insert().into(Constants.tablePhenotypes);
  q.set('phenotypeId', null);
  q.set('phenotypeName', phenotypeName);
  q.set('generationId', generationId);

  q = q.toString();

  logger.silly('Phenotype #create() Query: ', q);

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
  let phenotypeId = result.stmt.lastID;

  logger.debug('Phenotype #create() Created new Phenotype with ID:', phenotypeId);

  let phenotype = {
    'phenotypes': {}
  }

  phenotype.phenotypes[phenotypeId] = {
    'phenotypeId': phenotypeId,
    'phenotypeName': phenotypeName,
    'generationId': generationId
  }
  logger.debug('Phenotype #create() Created new Phenotype:', phenotype);
  return phenotype;
}

Phenotype.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;

  // init query
  let q = squel.select().from(Constants.tablePhenotypes, 'phenotypes');
  Utils.leftJoinGenerations(q);
  Utils.leftJoinFamilies(q);
  q.group('phenotypes.phenotypeId');

  // set fields
  logger.debug('Phenotype() allowedFields:', Phenotype.allowedFields);
  logger.debug('Phenotype() fieldAliases:', Phenotype.fieldAliases);
  Utils.setFields(q, fieldAliases, fields);

  // We always want the ids
  q.fields(['phenotypes.phenotypeId', 'generations.generationId', 'families.familyId']);


  // set where
  Utils.setWhere(q, allowedFields, options);

  // set limit && offset
  Utils.setLimitAndOffset(q, options);

  q = q.toString();
  logger.debug('Phenotype #get() Query:', q);

  // execute query
  let rows;
  try {
    rows = await sqlite.all(q);
  } catch(err) {
    throw err;
  }

  // build generations object
  let phenotypes = {
    phenotypes: {},
    generations: {},
    families: {}
  };

  logger.silly('Phenotype #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    Utils.addFamilyFromRowToReturnObject(row, phenotypes, options);
    Utils.addGenerationFromRowToReturnObject(row, phenotypes, options);
    Utils.addPhenotypeFromRowToReturnObject(row, phenotypes, options, true);
  });

  Utils.deleteEmptyProperties(phenotypes, ['families', 'generations']);

  return phenotypes;

}
