'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('./constants');
const logger = require('./logger');

/**
 * Set of utils mainly used for query building.
 * @namespace QueryUtils
 */
let QueryUtils = exports;


/**
 * Join all related tables of Generations. Does NOT join generation itsel.
 * With the joinGenerationParents flag you can set if we want to join
 * GenerationParents too or not.
 * Mutates queryObj.
 *
 * @param {squel} queryObj
 *        Squel Query Builder to add joins
 * @param {boolean} [joinGenerationParents=true]
 *        True if we want to join generationParents
 */
QueryUtils.joinRelatedGenerations = function(queryObj, joinGenerationParents = true) {
  if(joinGenerationParents == true) {
    QueryUtils.joinGenerationParentsOnly(queryObj);
  }
  QueryUtils.joinFamilies(queryObj);
};


/**
 * Join to all related tables of Genotypes.
 * This will also execute QueryUtils.joinRelatedGenerations(queryObj).
 * Mutates queryObj.
 *
 * @param {squel} queryObj
 *        Squel Query Builder to add joins
 * @returns {undefined}
 */
QueryUtils.joinRelatedGenotypes = function(queryObj) {
  QueryUtils.joinGenerations(queryObj);

  // Because with QueryUtils.joinGenerations we already join
  // generation_parents and generations, we don't have to join
  // generation_parents again, therefore set false
  QueryUtils.joinRelatedGenerations(queryObj, false);
};


/**
 * Joins all related tables of Plant. So joins all genotypes, joins all related
 * tables of genotype (which joins generations, which joins all related tables
 * of generation...)
 * Mutates queryObj.
 * @param {squel} queryObj
 *        Squel Query Builder to add joins
 * @returns {undefined}
 */
QueryUtils.joinRelatedPlants = function(queryObj) {
  QueryUtils.joinGenotypes(queryObj);
  QueryUtils.joinRelatedGenotypes(queryObj);
};

/**
 * Left joins families by referencing to generations.familyId. Mutates query
 * @param  {squel} query
 *         Squel query capable of an .left_join()
 */
QueryUtils.joinFamilies = function (query) {
  query.left_join(CONSTANTS.TABLE_FAMILIES,
    'families',
    'generations.familyId = families.familyId');
};

/**
 * Left joins generations and generation_parents by referencing to
 * genotypes.generationId. Mutates query
 * @param  {squel} query
 *         Squel query capable of an .left_join()
 */
QueryUtils.joinGenerations = function (query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS,
    'generations',
    'genotypes.generationId = generations.generationId'
  );
  // We also have to join generation_parents
  QueryUtils.joinGenerationParentsOnly(query);
};

/**
 * Only join generation parents. Mutates query.
 * @param  {squel} query
 *         Squel query which can take an .left_join()
 */
QueryUtils.joinGenerationParentsOnly = function (query) {
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS,
    'generation_parents',
    'generations.generationId = generation_parents.generationId'
  );
};

/**
 * Left joins genotypes by referencing to plants.genotypeId. Mutates query
 * @param  {squel} query
 *         Squel query capable of an .left_join()
 */
QueryUtils.joinGenotypes = function (query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES,
    'genotypes',
    'plants.genotypeId = genotypes.genotypeId'
  );
};

/**
 * Left joins generations by referencing to families.familyId.
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.joinGenerationsDownwards = function (query) {
  query.left_join(CONSTANTS.TABLE_GENERATIONS,
    'generations',
    'families.familyId = generations.familyId'
  );
  query.left_join(CONSTANTS.TABLE_GENERATION_PARENTS,
    'generation_parents',
    'generations.generationId = generation_parents.generationId'
  );
};

/**
 * Left joins Genotypes by referencing to generations.generationId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.joinGenotypesDownwards = function (query) {
  query.left_join(CONSTANTS.TABLE_GENOTYPES,
    'genotypes',
    'generations.generationId = genotypes.generationId'
  );
};

/**
 * Left joins Plants by referencing to genotypes.genotypeId
 * @param  {squel} query - Squel query capable of an .left_join()
 */
QueryUtils.joinPlantsDownwards = function (query) {
  query.left_join(CONSTANTS.TABLE_PLANTS,
    'plants',
    'genotypes.genotypeId = plants.genotypeId'
  );
};

/**
 * Sets fields to select for squel query object.
 * For this we take a criteriaAttributes array which holds all attributes in a
 * use wants to have. We check them againt allowedAttributes and only select
 * attributes which are allowed. If criteriaAttributes is empty, we simply use
 * all allowedAttributes. Mutates query object.
 * @param {squel} fieldsToSelect
 *        Squel obejct. Has to be in select() state or similiar to take a
 *        field() call.
 * @param {String[]} allowedAttributes
 *        Array of attributes which are allowed to select.
 * @param {String[]} criteriaAttributes
 *        Array of attributes a user wants to have.
 */
QueryUtils.setFields = function (query, allowedAttributes, criteriaAttributes) {
  let attributesToSelect;
  if(_.isEmpty(criteriaAttributes)) {
    // if criteriaAttributes is empty, just select all allowedAttributes
    attributesToSelect = allowedAttributes;
  } else {
    // otherwise we only want attributes which are in both, criteriaAttributes
    // and allowedAttributes.
    attributesToSelect = _.intersection(allowedAttributes, criteriaAttributes);
  }

  _.each(attributesToSelect, function(attr) {
    if(attr == 'generationParents') {
      // special case, generationParents is no real column, but a concat
      // of all plantIds
      query.field(
        'group_concat(' + CONSTANTS.TABLE_GENERATION_PARENTS +'.plantId) as generationParents'
      );
    }else {
      // translate attribute to explicit column name (tablename.attr)
      query.field(
        QueryUtils.getTableOfField(attr) + '.' + attr
      );
    }
  });
};

/**
 * Takes an squel query object and sets limit() and offset() depending on the
 * given criteria object. Default limit is 10, default offset 0.
 * Mutates query object.
 * @param {squel} query
 *        Squel obejct. Has to be in a state to take a limit() and offset()
 *        function call.
 * @param {object} criteria
 *        criteria object. Can be empty.
 * @param {int} [criteria.limit=10]
 *        Limit to set. If empty, will set to 10.
 * @param {int} [criteria.offset=0]
 *        Offset to set. If empty, will set to 0.
 */
QueryUtils.setLimitAndOffset = function (query, criteria) {
  let limit = criteria.limit || 10;
  let offset = criteria.offset || 0;
  query.limit(limit).offset(offset);
};

/**
 * This function sets the where parts for our queries and handles
 * many special cases. Mutates query.
 * @todo Add arrays of integers/strings to all fields not only parents.
 *       Add $contains, add $like, add $gt, $lt, $gte, $lte, $startswith, $endswith
 *       $and, $or, $not
 * @param  {squel} query
 *         squel query, needs to be in a state to take .where() calls
 * @param  {string[]} allowedFields
 *         An array of allowed field names
 * @param  {Object} criteria
 *         criteria object which gets passed to update/delete/find functions.
 *         We only use the criteria.where part, we ignore everything else.
 * @param  {Object.<String, Object>} [criteria.where]
 *         This object holds all the control info for this function, not needed,
 *         but if you want this function to do a thing, this is needed.
 *         The key element has to be inside allowedFields, Otherwise it will
 *         get skipped. The Value can be a String, an integer or an array of
 *         strings/integers if you want that the value matches exactly.
 *         Eg: {where: {'generationId': 1}} => generationId has to be 1
 *             {where: {'generationParents': [1,2]}} => generationParents have
 *                                                      to be 1 and 2.
 *             {where: {'plantSex': 'male'}} => only male plants
 */
QueryUtils.setWhere = function(query, allowedFields, criteria) {
  // if criteria.where is not set/an plain object, we can stop here
  if(!_.isPlainObject(criteria.where)) return;

  let table;
  _.each(criteria.where, function(fieldValue, field) {
    if(_.indexOf(allowedFields, field) === -1) return;

    logger.silly('criteria.where field/fieldValue:', field, fieldValue);
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
        let where = '';
        _(fieldValue).map(_.toInteger).each(function(plantId, i) {
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
      if(isValid !== false) query.where('\'generations\'.\'generationId\' IN (?)', subQuery);
    }
  });
};

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
QueryUtils.getTableOfField = function (field) {
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
};
