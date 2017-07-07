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
    QueryUtils.leftJoinGenerationParentsOnly(queryObj);
  }
  QueryUtils.leftJoinFamilies(queryObj);
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
  QueryUtils.leftJoinGenerations(queryObj);

  // Because with QueryUtils.leftJoinGenerations we already join
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
  QueryUtils.leftJoinGenotypes(queryObj);
  QueryUtils.joinRelatedGenotypes(queryObj);
}

/**
 * Takes an squel query object and sets all field alisaes of fieldsToSelect which are
 * in allowedFields as a key property. Mutates query object.
 * See QueryUtils._setFields() for more information.
 * @param {squel} fieldsToSelect - Squel obejct. Has to be in select() state or similiar to
 *                                 take a fields() call.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 */
QueryUtils.setFields = function setFields(query, allowedFields, fieldsToSelect) {
  query.fields(QueryUtils._setFields(allowedFields, fieldsToSelect));
}

/**
 * Helper function of QueryUtils.setFields(), decides which fields should find selected
 * later in the main function. Criterias: field has to be in allowedFields. Will
 * find translated to alias.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 * @return {array}               - translated and verfied alias fields
 */
QueryUtils._setFields = function _setFields(allowedFields, fieldsToSelect) {
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
 * Takes an squel query object and sets limit() and offset() depending on the
 * given options object. Default limit is 10, default offset 0.
 * Mutates query object.
 * @param {squel} query          - Squel obejct. Has to be in a state to take a
 *                                 limit() and offset() function call.
 * @param {object} options       - options object. Can be empty.
 * @param {int} [options.limit]  - Limit to set. If empty, will set to 10.
 * @param {int} [options.offset] - Offset to set. If empty, will set to 0.
 */
QueryUtils.setLimitAndOffset = function setLimitAndOffset(query, options) {
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
QueryUtils.setWhere = function(query, allowedFields, options) {
  // if options.where is not set/an plain object, we can stop here
  if(!_.isPlainObject(options.where)) return;

  let table;
  _.each(options.where, function(fieldValue, field) {
    if(_.indexOf(allowedFields, field) === -1) return;
    logger.silly('options.where field/fieldValue:', field, fieldValue);

    table = QueryUtils.getTableOfField(field);

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
 * Determines in which table this column is. This works because all column names
 * use a prefix, which should be equivalent to the table name.
 * Eg: familyId => family, plantClonedFrom => plant
 * @param  {string} Field
 *         column name. Eg. familyId, familyName, generationId, generationName,
 *         generationParent, genotypeId...
 * @return {string}
 *         Determined Table name
 */
QueryUtils.getTableOfField = function getTableOfField(field) {
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
 * Left joins families by referencing to generations.familyId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinFamilies = function leftJoinFamilies(query) {
  query.left_join(CONSTANTS.TABLE_FAMILIES, 'families', 'generations.familyId = families.familyId');
}

/**
 * Left joins generations and generation_parents by referencing to
 * genotypes.generationId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinGenerations = function leftJoinGenerations(query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS, 'generations', 'genotypes.generationId = generations.generationId');
  // We also have to join generation_parents
  QueryUtils.leftJoinGenerationParentsOnly(query);
}


QueryUtils.leftJoinGenerationParentsOnly = function leftJoinGenerationParentsOnly(query) {
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents', 'generations.generationId = generation_parents.generationId');
}

/**
 * Left joins genotypes by referencing to plants.genotypeId. Mutates query
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinGenotypes = function leftJoinGenotypes(query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES, 'genotypes', 'plants.genotypeId = genotypes.genotypeId');
}

/**
 * Left joins generations by referencing to families.familyId.
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinGenerationsDownwards = function leftJoinGenerationsDownwards(query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS, 'generations', 'families.familyId = generations.familyId');
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents', 'generations.generationId = generation_parents.generationId');
}

/**
 * Left joins Genotypes by referencing to generations.generationId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinGenotypesDownwards = function leftJoinGenotypesDownwards(query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES, 'genotypes', 'generations.generationId = genotypes.generationId');
}

/**
 * Left joins Plants by referencing to genotypes.genotypeId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.leftJoinPlantsDownwards = function leftJoinPlantsDownwards(query) {
  query.left_join(CONSTANTS.TABLE_PLANTS, 'plants', 'genotypes.genotypeId = plants.genotypeId');
}

QueryUtils.explicitColumName = function(column, table = null) {

}
