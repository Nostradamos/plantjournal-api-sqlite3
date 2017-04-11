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
      throw e;
    }
  }
  let phenotypeId = result.stmt.lastID;

  let phenotype = {
    'phenotypes': {}
  }

  phenotype.phenotypes[phenotypeId] = {
    'phenotypeId': phenotypeId,
    'phenotypeName': phenotypeName,
    'generationId': generationId
  }

  return phenotype;
}

Phenotype.get = async function get(options) {
  // parse options
  if(_.isNil(options)) options = {};

  let fields = options.fields || false;
  let limit = options.limit || 10;
  let offset = options.offset || 0;

  // init query
  let q = squel.select().from('phenotypes', 'phenotypes');
  q.left_join('generations', 'generations', 'phenotypes.generationId = generations.generationId');
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
  if(_.isPlainObject(options.where)) {
    let allowedFields = ['phenotypeId', 'phenotypeName', 'generationId', 'generationName', 'familyId', 'familyName'];
    await _.each(options.where, function(value, key) {
      if(_.indexOf(allowedFields, key) === -1) return;
      logger.silly('options.where key/value:', key, value);

      if(_.isInteger(value) || _.isString(value)) {
        let table;
        if(_.startsWith(key, 'phenotype')) {
          table = 'phenotypes';
        } else if(_.startsWith(key, 'generation')) {
          table = 'generations';
        } else {
          table = 'families';
        }
        q.where('?.? = ?', table, key, value);
      }
    });
  }

  // set limit && offset
  q.limit(limit).offset(offset);

  q = q.toString();
  logger.debug('Phenotype #get() Query:', q);

  // execute query
  let rows;
  try {
    rows = await sqlite.all(q);
  } catch(e) {
    throw e;
  }

  // build generations object
  let phenotypes = {
    phenotypes: {},
    generations: {},
    families: {}
  };

  logger.silly('Phenotype #get() rows:', JSON.stringify(rows));
  await _.each(rows, function(row) {
    let phenotypeId = row.phenotypeId;
    let generationId = row.generationId;
    let familyId = row.familyId;

    let phenotype = {
      'phenotypeId': phenotypeId,
      'generationId': generationId,
      'familyId': familyId
    };

    // First set key/values for phenotype
    if(_.has(row, 'phenotypeName')) phenotype['phenotypeName'] = row.phenotypeName;

    // Next generations
    if(!_.has(phenotypes.generations, generationId)) {
      let generation = {
        'generationId': generationId,
        'familyId': familyId
      }
      if(_.has(row, 'generationName')) {
        generation['generationName'] = row.generationName;
        phenotypes.generations[generationId] = generation;
      }
    }

    // Next families
    if(!_.has(phenotypes.families, familyId)) {
      let family = {
        'familyId': familyId
      }
      if(_.has(row, 'familyName')) {
        family['familyName'] = row.familyName;
        phenotypes.families[familyId] = family;
      }
    }
    phenotypes.phenotypes[phenotypeId] = phenotype;
  });

  Utils.deleteEmptyProperties(phenotypes, ['generations', 'families']);

  return phenotypes;

}
