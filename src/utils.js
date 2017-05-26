'use strict';

const _ = require('lodash');
const logger = require('./logger');
const squel = require('squel');
const CONSTANTS = require('./constants');

let Utils = exports;

/**
 * Mutates obj to only contain non empty properties. You can limit it with
 * limitTo to specific properties.
 *
 * @param  {object} obj      - [description]
 * @param  {array} [limitTo] - Array of properties. If this is set, function
 *                             will only delete empty properties where key is
 *                             defined in this array.
 * @return {object}          - returns obj again (also mutates obj)
 */
Utils.deleteEmptyProperties = function deleteEmptyProperties(obj, limitTo) {
  if(_.isEmpty(limitTo)) limitTo = _.keys(obj);
  _(limitTo).filter(o => _.isEmpty(obj[o])).each(u => {_.unset(obj, u);});
  return obj;
}

/**
 * Helper function of Utils.setFields(), decides which fields should find selected
 * later in the main function. Criterias: field has to be in allowedFields. Will
 * find translated to alias.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 * @return {array}               - translated and verfied alias fields
 */
Utils._setFields = function _setFields(allowedFields, fieldsToSelect) {
  let fields;
  if(_.isEmpty(fieldsToSelect)) {
    // If fieldsToSelect is empty, we want to select all allowedFields.
    fields = _.values(allowedFields);
  } else {
    // Otherwise, only select fields which are in both fieldsToSelect and allowedFields
    fields = _(fieldsToSelect).map(f => allowedFields[f])
      .remove(v => {return !_.isUndefined(v)}).value();
  }
  return fields;
}

/**
 * Takes an squel query object and sets all field alisaes of fieldsToSelect which are
 * in allowedFields as a key property. Mutates query object.
 * See Utils._setFields() for more information.
 * @param {squel} fieldsToSelect - Squel obejct. Has to be in select() state or similiar to
 *                                 take a fields() call.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 */
Utils.setFields = function setFields(query, allowedFields, fieldsToSelect) {
  query.fields(Utils._setFields(allowedFields, fieldsToSelect));
}

/**
 * Takes an squel query object and sets limit() and offset() depending on the
 * given options object. Default limit is 10, default offset 0.
 * Mutates query object.
 * @param {squel} query          - Squel obejct. Has to be in a state to take a
 *                                 limit() and offset() function call.
 * @param {object} options       - options object. Can be empty.
 * @param {int} [options.limit]  - Limit to set. If empty, will set to 10.
 * @param {int} [options.offset] - Offset to set. If empty, will set to 0.
 */
Utils.setLimitAndOffset = function setLimitAndOffset(query, options) {
  let limit = options.limit || 10;
  let offset = options.offset || 0;
  query.limit(limit).offset(offset);
}

/**
 * This function sets the where parts for our queries and handles
 * many special cases. Mutates query.
 *
 * @param  {squel} query            - squel query, needs to be in a state to take .where() calls
 * @param  {string[]} allowedFields - An array of allowed field names
 * @param  {object} options         - options object which finds passed 'squel');
const CONSTANTS = require('./constants');
 to any find function. We
 *                                    mainly concentrate in this function on the options.where part.
 */
Utils.setWhere = function(query, allowedFields, options) {
  // if options.where is not set/an plain object, we can stop here
  if(!_.isPlainObject(options.where)) return;

  let table;
  _.each(options.where, function(fieldValue, field) {
    if(_.indexOf(allowedFields, field) === -1) return;
    logger.silly('options.where field/fieldValue:', field, fieldValue);

    table = Utils.whichTableForField(field);

    // 42 == 42 or 'somestring' == 'somestring'
    if(_.isInteger(fieldValue) || _.isString(fieldValue)) {
      query.where('?.? = ?', table, field, fieldValue);
    } else if(field === 'generationParents') {
      // generationParents is a bit different, because we want it to 'act'
      // like an array of plantIds and we have to sub query `generation_parents`.
      let subQuery = squel.select()
        .from(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents')
        .field('generation_parents.generationId')
        .group('generation_parents.generationId');
      let isValid = true;
      // eg: where : { generationParents: [1,2]}
      // make sure generation has all those parents and no more. [1,2] == [1,2]
      if(_.isArray(fieldValue)) {
        let where = "";
        _(fieldValue).map(_.toInteger).each(function(plantId, i) {
          console.log(plantId);
          where = where + 'generation_parents.plantId = ?' + (i < fieldValue.length-1 ? ' OR ' : '');
        });
        logger.silly('Utils #setWhere() generationParents where:', where.toString());
        subQuery.where.apply(this, _.concat([where], fieldValue));
        subQuery.having('count(generation_parents.plantId) = ?', fieldValue.length);

      }else {
        isValid = false;
      }

      logger.debug('Utils #setWhere() subQuery for generation_parents:', subQuery.toString());

      // Only add subQuery if our fieldValue is somehow valid
      if(isValid !== false) query.where(`'generations'.'generationId' IN (?)`, subQuery);
    }
  });
}

/**
 * Determines which field is hold in which table.
 * @param  {string} field - field name. Eg. familyId, familyName, generationId, generationName, generationParent, genotypeId...
 * @return {string}       - table name
 */
Utils.whichTableForField = function whichTableForField(field) {
  // determine which table we need
  let table;
  if(_.startsWith(field, 'plant')) {
    table = CONSTANTS.TABLE_PLANTS;
  } else if(_.startsWith(field, 'genotype')) {
    table = CONSTANTS.TABLE_GENOTYPES;
  } else if(field === 'generationParents') {
    table = CONSTANTS.TABLE_GENERATION_PARENTS;
  } else if(_.startsWith(field, 'generation')) {
    table = CONSTANTS.TABLE_GENERATIONS;
  } else if(_.startsWith(field, 'family')) {
    table = CONSTANTS.TABLE_FAMILIES;
  } else {
    throw new Error('cannot associate field with a table');
  }
  return table;
}

/**
 * Adds to returnObject.plants[row.plantId] the plant object if row.plantName
 * is set. Plant Object holds all information available in row which are important for plant.
 * Mutates returnObject.
 * @param {object} row          - Row object from sqlite. row.{plantId|genotypeId|generationId|familyId} have to be set.
 * @param {object} returnObject - Object which will find returned from pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {object} options      - options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false] - adds to returnObject even if row.generatioName is not set.
 */
Utils.addPlantFromRowToReturnObject = function addPlantFromRowToReturnObject(row, returnObject, options, forceAdd) {
  let plantId = row.plantId;

  let plant = {
    'genotypeId': row.genotypeId,
    'generationId': row.generationId,
    'familyId': row.familyId
  };
  _.each(CONSTANTS.FIELDS_PLANT, function(field) {
    if(_.has(row, field)) plant[field] = row[field];
  });
  if(forceAdd === true || _.size(plant) > 4) returnObject.plants[plantId] = plant;
}

/**
 * Adds to returnObject.genotypes[row.genotypeId] the genotype object if row.genotypeName
 * is set. Genotype Object holds all information available in row which are important for genotype.
 * Mutates returnObject.
 * @param {object} row          - Row object from sqlite. row.{genotypeId|generationId|familyId} have to be set.
 * @param {object} returnObject - Object which will find returned from pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {object} options      - options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false]     - adds to returnObject even if row.generatioName is not set.
 */
Utils.addGenotypeFromRowToReturnObject = function addGenotypeFromRowToReturnObject(row, returnObject, options, forceAdd) {
  let genotypeId = row.genotypeId;
  let genotype = {
      'generationId': row.generationId,
      'familyId': row.familyId
  };
  _.each(CONSTANTS.FIELDS_GENOTYPE, function(field) {
    if(_.has(row, field)) genotype[field] = row[field];
  });
  if(forceAdd === true || _.size(genotype) > 3) returnObject.genotypes[genotypeId] = genotype;

}

/**
 * Adds to returnObject.generations[row.generationId] the generation object if at least one of
 * [row.generationName, row.generationParents] is set.
 * Generation Object holds all information in row which are important for generation.
 * Mutates returnObject.
 * @param {object} row              - Row object from sqlite. row.{generationId|familyId} have to be set.
 * @param {object} returnObject     - Object which will find returned from pj.{Plant|Plant|Generation|...|Family}.find. Gets mutated.
 * @param {object} options          - options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false] - adds to returnObject even if row.generatioName is not set.
 */
Utils.addGenerationFromRowToReturnObject = function addGenerationFromRowToReturnObject(row, returnObject, options, forceAdd) {
  let generationId = row.generationId;
  let generation = {
    'familyId': row.familyId
  }

  _.each(CONSTANTS.FIELDS_GENERATION, function(field) {
    if(_.has(row, field)) {
      let rowField = row[field];
      // if we have row.generationParents and it's null, set an empty array [], else split it into an array
      // and cast every element to an integer
      if(field === 'generationParents') {
        rowField = rowField === null ? [] : _(rowField).split(',').map(_.toInteger).value();
      }
      generation[field] = rowField;
    }
  });
  // Make sure that we only add it returnObject if we not only have generationId and familyId set.
  if(forceAdd === true || _.size(generation) > 2) returnObject.generations[generationId] = generation;
}

/**
 * Adds to returnObject.families[row.familyId] the family object if row.familyName
 * is set. Mutates returnObject.
 * @param {object} row          - Row object from sqlite. row.familyId has to be set.
 * @param {object} returnObject - Object which will find returned from pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {object} options      - options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false] - adds to returnObject even if row.generatioName is not set.
 */
Utils.addFamilyFromRowToReturnObject = function addFamilyFromRowToReturnObject(row, returnObject, options, forceAdd) {
  let familyId = row.familyId;
  let family = {};
  _.each(CONSTANTS.FIELDS_FAMILY, function(field) {
    if(_.has(row, field)) family[field] = row[field];
  });

  // Make sure we have at least two fields, or forceAdd = true
  if(forceAdd === true || _.size(family) > 1) {
    returnObject.families[familyId] = family;
  }
}

/**
 * Adds to returnObject found and remaining count. Mutates returnObject.
* @param {object}  count        - Count object. Should be sqlite result.
* @param {integer} count.count  - How many records could be found for this
                                  request?
* @param {integer} lenRows      - how many records got grabbed in this request?
* @param {object}  returnObject - Object which will find returned from
                                  pj.{Plant|Plant|Generation|...|Famiy}.find.
                                  Gets mutated.
* @param {object}  options      - options which got passed to the find function.
*/
Utils.addFoundAndRemainingFromCountToReturnObject = function addFoundAndRemainingFromCountToReturnObject(count, lenRows, returnObject, options) {
  let c = count['count'];
  returnObject['found'] = c;
  returnObject['remaining'] = c - lenRows - (options.offset || 0);
}


/**
 * Left joins families by referencing to generations.familyId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinFamilies = function leftJoinFamilies(query) {
  query.left_join(CONSTANTS.TABLE_FAMILIES, 'families', 'generations.familyId = families.familyId');
}

/**
 * Left joins generations and generation_parents by referencing to
 * genotypes.generationId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinGenerations = function leftJoinGenerations(query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS, 'generations', 'genotypes.generationId = generations.generationId');
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents', 'generations.generationId = generation_parents.generationId');
}

/**
 * Left joins genotypes by referencing to plants.genotypeId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinGenotypes = function leftJoinGenotypes(query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES, 'genotypes', 'plants.genotypeId = genotypes.genotypeId');
}

/**
 * Left joins generations by referencing to families.familyId.
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinGenerationsDownwards = function leftJoinGenerationsDownwards(query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS, 'generations', 'families.familyId = generations.familyId');
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents', 'generations.generationId = generation_parents.generationId');
}

/**
 * Left joins Genotypes by referencing to generations.generationId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinGenotypesDownwards = function leftJoinGenotypesDownwards(query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES, 'genotypes', 'generations.generationId = genotypes.generationId');
}

/**
 * Left joins Plants by referencing to genotypes.genotypeId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
Utils.leftJoinPlantsDownwards = function leftJoinPlantsDownwards(query) {
  query.left_join(CONSTANTS.TABLE_PLANTS, 'plants', 'genotypes.genotypeId = plants.genotypeId');
}

Utils.hasToBeAssocArray = function hasToBeAssocArray(obj, prefix = 'First argument') {
  if(!_.isObjectLike(obj) || _.isArray(obj)) {
    throw new Error(prefix + ' has to be an associative array');
  }
}

Utils.hasToBeString = function optionsHasString(obj, property, name = 'options') {
  if(_.has(obj, property) && !_.isString(obj[property])) {
    throw new Error(name + '.' + property + ' has to be a string');
  }
}

Utils.hasToBeInt = function hasToBeInt(obj, property, name = 'options') {
  if(_.has(obj, property) && !_.isInteger(obj[property])) {
    throw new Error(name + '.' + property + ' has to be an integer');
  }
}

Utils.hasToBeIntArray = function hasToBeIntArray(obj, property, name = 'options') {
  if(_.has(obj, property) && (!_.isArray(obj[property]) || !_.every(obj[property], _.isInteger))) {
    throw new Error(name + '.' + property + ' has to be an array of integers');
  }
}

Utils.hasToBeSet = function hasToBeSet(obj, property, name = 'options') {
  if(!_.has(obj, property)) {
    throw new Error(name + '.' + property + ' has to be set');
  }
}

Utils.getUnixTimestampUTC = function getUnixTimestampUTC() {
  return Math.floor(new Date() / 1000);
}

/**
 * Converts Set to array and filters out null. Mutates set.
 * @param  {Set} set - Set to filter and convert
 * @return {Array}
 */
Utils.filterSetNotNull = function filterSetNotNull(set) {
  set.delete(null);
  return Array.from(set);
}
