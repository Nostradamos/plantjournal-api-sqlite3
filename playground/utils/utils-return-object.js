'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const Utils = require('./utils');
const UtilsJSON = require('./utils-json');

/**
 * UtilsReturnObject
 * Utils for adding information out of the from the sqlite3 database
 * returned rows into our so called returnObject. The returnObject
 * always holds all the information from a find query.
 * @namespace
 */
let UtilsReturnObject = exports;

/**
 * Adds to returnObject.families[row.familyId] the family object if
 * row.familyName is set. Mutates returnObject.
 * @param {object} row
 *        Row object from sqlite. row.familyId has to be set.
 * @param {object} returnObject
 *        Object which will find returned from
 *        pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {bool} [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addFamily = (row, returnObject, forceAdd) => {
  let familyId = row[CONSTANTS.ATTR_ID_FAMILY];

  if(familyId === null) return;

  let family = {};

  for (let attr of CONSTANTS.ALL_ATTRIBUTES_FAMILY) {
    let value = row[attr];
    if (_.isUndefined(value))  continue;

    if(attr === CONSTANTS.ATTR_GENERATIONS_FAMILY)
      value = Utils.splitToInt(value);

    family[attr] =  value;
  }

  // Make sure we have at least two attrs, or forceAdd = true
  if (forceAdd === true || _.size(family) > 1)
    returnObject.families[familyId] = family;
};

/**
 * Adds to returnObject.generations[row.generationId] the generation object if
 * at least one of [row.generationName, row.generationParents] is set.
 * Generation Object holds all information in row which are important for
 * generation.
 * Mutates returnObject.
 * @param {object} row
 *        Row object from sqlite. row.{generationId|familyId} have to be set.
 * @param {object} returnObject
 *        Object which will find returned from pj.{Plant|Plant|...|Family}.find.
 *        Gets mutated.
 * @param {bool} [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addGeneration = (row, returnObject, forceAdd) => {
  let generationId = row[CONSTANTS.ATTR_ID_GENERATION];

  if(generationId === null) return;

  let generation = {[CONSTANTS.ATTR_ID_FAMILY]: row[CONSTANTS.ATTR_ID_FAMILY]};

  for(let attr of CONSTANTS.ALL_ATTRIBUTES_GENERATION) {
    let value = row[attr];
    if (_.isUndefined(value)) continue;

    if (attr === CONSTANTS.ATTR_PARENTS_GENERATION ||
        attr === CONSTANTS.ATTR_GENOTYPES_GENERATION)
      value = Utils.splitToInt(value);

    generation[attr] = value;

  }
  // Make sure that we only add it returnObject if we not only have
  // generationId and familyId set.
  if (forceAdd === true || _.size(generation) > 2)
    returnObject.generations[generationId] = generation;
};

/**
 * Adds to returnObject.genotypes[row.genotypeId] the genotype object if
 * row.genotypeName is set. Genotype Object holds all information available in
 * row which are important for genotype.
 * Mutates returnObject.
 * @param {object} row
 *        Row object from sqlite.
 *        row.{genotypeId|generationId|familyId} have to be set.
 * @param {object} returnObject
 *        Object which will find returned from
 *        pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addGenotype = (row, returnObject, forceAdd) => {
  let genotypeId = row[CONSTANTS.ATTR_ID_GENOTYPE];

  if(genotypeId === null) return;

  let genotype = {
    [CONSTANTS.ATTR_ID_GENOTYPE]: row[CONSTANTS.ATTR_ID_GENOTYPE],
    [CONSTANTS.ATTR_ID_FAMILY]: row[CONSTANTS.ATTR_ID_FAMILY]
  };

  for(let attr of CONSTANTS.ALL_ATTRIBUTES_GENOTYPE) {
    let value = row[attr];
    if (_.isUndefined(value)) continue;

    if(attr === CONSTANTS.ATTR_PLANTS_GENOTYPE) value = Utils.splitToInt(value);

    genotype[attr] = value;
  }
  if (forceAdd === true || _.size(genotype) > 3)
    returnObject.genotypes[genotypeId] = genotype;
};

/**
 * Adds to returnObject.plants[row.plantId] the plant object if row.plantName
 * is set. Plant Object holds all information available in row which are
 * important for plant. Mutates returnObject.
 * @param {object} row
 *        Row object from sqlite.
 *        row.{plantId|genotypeId|generationId|familyId} have to be set.
 * @param {object} returnObject
 *        Object which will find returned from
 *        pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addPlant = (row, returnObject, forceAdd) => {
  let plantId = row[CONSTANTS.ATTR_ID_PLANT];

  if(plantId === null) return;

  let plant = {
    [CONSTANTS.ATTR_ID_FAMILY]: row[CONSTANTS.ATTR_ID_FAMILY],
    [CONSTANTS.ATTR_ID_GENERATION]: row[CONSTANTS.ATTR_ID_GENERATION],
    [CONSTANTS.ATTR_ID_GENOTYPE]: row[CONSTANTS.ATTR_ID_GENOTYPE],
    [CONSTANTS.ATTR_ID_MEDIUM]: row[CONSTANTS.ATTR_ID_MEDIUM] || null,
    [CONSTANTS.ATTR_ID_ENVIRONMENT]: row[CONSTANTS.ATTR_ID_ENVIRONMENT] || null
  };

  for (let attr of CONSTANTS.ALL_ATTRIBUTES_PLANT) {
    let value = row[attr];
    if (_.isUndefined(value)) continue;

    if(attr === CONSTANTS.ATTR_CLONES_PLANT) value = Utils.splitToInt(value);
    plant[attr] = value;
  }

  if (forceAdd === true || _.size(plant) > 6)
    returnObject.plants[plantId] = plant;
};

/**
 * Adds at many environment attributes as possible from row to
 * returnObject.environments[environmentId].
 * @param {object} row
 *        Row object from sqlite. row.{environmentId} have to be set.
 * @param {object} returnObject
 *        Object which will contain information about found models.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addEnvironment = (row, returnObject, forceAdd) => {
  let environmentId = row[CONSTANTS.ATTR_ID_ENVIRONMENT];

  if(_.isUndefined(environmentId) || _.isNull(environmentId)) return;

  let environment = {};

  for(let attr of CONSTANTS.ALL_ATTRIBUTES_ENVIRONMENT) {
    let value = row[attr];
    if (_.isUndefined(value)) continue;

    if(attr === CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT)
      value = Utils.splitToInt(value);

    environment[attr] = value;
  }

  returnObject.environments[environmentId] = environment;
};

/**
 * Adds at many medium attributes as possible from row to
 * returnObject.mediums[mediumId].
 * @param {object} row
 *        Row object from sqlite. row.{mediumId} has to be set.
 * @param {object} returnObject
 *        Object which will contain information about found models.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
UtilsReturnObject.addMedium = (row, returnObject, forceAdd) => {
  let mediumId = row[CONSTANTS.ATTR_ID_MEDIUM];

  if(mediumId === null) return;

  let medium = {
  };

  for(let attr of CONSTANTS.ALL_ATTRIBUTES_MEDIUM) {
    let value = row[attr];
    if (_.isUndefined(value)) continue;

    if(attr === CONSTANTS.ATTR_PLANTS_MEDIUM) value = Utils.splitToInt(value);
    medium[attr] = value;
  }

  if (forceAdd === true || _.size(medium) > 2)
    returnObject.mediums[mediumId] = medium;
};

UtilsReturnObject.addJournal = (row, returnObject, forceAdd) => {
  let journalId = row[CONSTANTS.ATTR_ID_JOURNAL];
  let journal = {};

  let foreignAttributes = [
    CONSTANTS.ATTR_ID_ENVIRONMENT,
    CONSTANTS.ATTR_ID_MEDIUM,
    CONSTANTS.ATTR_ID_PLANT
  ];

  for (let attr of CONSTANTS.ALL_ATTRIBUTES_JOURNAL) {
    let value = row[attr];
    if (_.isUndefined(value) ||
        (_.isNull(value) && _.indexOf(foreignAttributes, attr) !== -1))
      continue;

    if (attr === CONSTANTS.ATTR_VALUE_JOURNAL)
      value = UtilsJSON.parseIfPossible(value);

    journal[attr] = value;
  }

  if (forceAdd === true || _.size(journal) > 4)
    returnObject.journals[journalId] = journal;
};

/**
 * Adds to returnObject found and remaining count. Mutates returnObject.
* @param {object}  count
*        Count object. Should be sqlite result.
* @param {integer} count.count
*        How many records could be found for this request?
* @param {integer} lenRows
*        how many records got grabbed in this request?
* @param {object}  returnObject
*        Object which will find returned from
*        pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
* @param {object}  options
*        options which got passed to the find function.
*/
UtilsReturnObject.addFoundAndRemaining =
function (count, lenRows, returnObject, options) {
  let found = count.count;
  let offset = options.offset || 0;
  let remaining = found - offset - lenRows;

  // Make sure we don't go negative
  if(remaining < 0) remaining = 0;

  returnObject.found = found;
  returnObject.remaining = remaining;
};
