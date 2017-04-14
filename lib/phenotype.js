'use strict';

const logger = require('./logger');

const squel = require('squel');
const sqlite = require('sqlite');
const _ = require('lodash');
const Utils = require('./utils');

let Phenotype = exports;

Phenotype.create = async function create(options) {
  if(_.isNil(options)) options = {};

  if(!_.has(options, 'generationId')) throw new Error('options.generationId is not set');

  let phenotypeName = options.phenotypeName || null;
  let generationId = options.generationId;

  // Build query
  let q = squel.insert().into('phenotypes');
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
  let q = squel.select().from('phenotypes', 'phenotypes');
  q.left_join('generations', 'generations', 'phenotypes.generationId = generations.generationId');
  q.left_join('generation_parents', 'generation_parents', 'generations.generationId = generation_parents.generationId');
  q.group('generations.generationId');
  q.left_join('families', 'families', 'generations.familyId = families.familyId');

  // set fields
  Utils.setFields(q,
     {'phenotypeName': 'phenotypes.phenotypeName',
    'generationName': 'generations.generationName',
    'familyName': 'families.familyName'},
    fields
  );

  // We always want the ids
  q.fields(['phenotypes.phenotypeId', 'generations.generationId', 'families.familyId']);


  // set where
  let allowedFields = ['phenotypeId', 'phenotypeName', 'generationId', 'generationName', 'familyId', 'familyName'];
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
