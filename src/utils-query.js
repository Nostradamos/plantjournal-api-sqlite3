'use strict';

const _ = require('lodash');

const CONSTANTS = require('./constants');

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
    if (joinGenerationParents == true) {
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
 * Sets attributes to select for squel query object.
 * For this we take a criteriaAttributes array which holds all attributes in a
 * use wants to have. We check them againt allowedAttributes and only select
 * attributes which are allowed. If criteriaAttributes is empty, we simply use
 * all allowedAttributes. Mutates query object.
 * @todo use whole criteria object and not only criteria.attributes
 * @param {squel} query
 *        Squel obejct. Has to be in select() state or similiar to take a
 *        field() call.
 * @param {String[]} allowedAttributes
 *        Array of attributes which are allowed to select.
 * @param {String[]} criteriaAttributes
 *        Array of attributes a user wants to select.
 */
QueryUtils.applyCriteriaAttributes = function (query, allowedAttributes, criteriaAttributes) {
    let attributesToSelect;
    if (_.isEmpty(criteriaAttributes)) {
    // if criteriaAttributes is empty, just select all allowedAttributes
        attributesToSelect = allowedAttributes;
    } else {
    // otherwise we only want attributes which are in both, criteriaAttributes
    // and allowedAttributes.
        attributesToSelect = _.intersection(allowedAttributes, criteriaAttributes);
    }

    _.each(attributesToSelect, function(attr) {
        if (attr == 'generationParents') {
            // special case, generationParents is no real column, but a concat
            // of all plantIds
            query.field(
                'group_concat(' + CONSTANTS.TABLE_GENERATION_PARENTS +'.plantId) as generationParents'
            );
        } else {
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
QueryUtils.applyCriteriaLimitAndOffset = function (query, criteria) {
    let limit = criteria.limit || 10;
    let offset = criteria.offset || 0;
    query.limit(limit).offset(offset);
};

/**
 * Translates and applies criteria.sort instructions to squel query builder.
 * This allows you to sort by one or more attributes ascending or descending
 * (also mixed).
 * See this criteria examples:
 * Sort by generationId ascending
 * {
 *  sort: "generationId ASC"
 * }
 *
 * Sort by generationId ascending
 * {
 *  sort: "generationId"
 * }
 *
 * Sort by generation descending
 * {
 *  sort: "generationId DESC"
 * }
 *
 * Sort by generationId ascending AND by familyId descending.
 * {
 *  sort: ["generationId ASC", "familyId DESC"]
 * }
 * @param {squel} query
 *        Squel obejct. Has to be in select() state or similiar to take a
 *        sort() call.
 * @param {String[]} allowedAttributes
 *        Array of attributes which are allowed to sort.
 * @param {Object} criteria
 *        Criteria object. If this method should do anything, set
 *        criteria.sort.
 * @param {String|String[]} criteria.sort
 *        criteria.sort can be a string or an array of strings.
 *        In both cases strings have to be in the following format:
 *        "<attributeName> <ASC|DESC" or only "<attributeName>" if you
 *        want to sort ascending.
 * @throws {Error}
 *         If attribute is illegal (not in allowedAttributes) or the order type
 *         is unknown (not ASC or DESC).
 */
QueryUtils.applyCriteriaSort = function(query, allowedAttributes, criteria) {
    if (_.isEmpty(criteria.sort)) return;
    if (!_.isArray(criteria.sort)) criteria.sort = [criteria.sort];

    _.each(criteria.sort, function(sortStr) {
        // Check if this is a valid format
        let attr, sortType;
        if (_.indexOf(sortStr, ' ') === -1) {
        // No whitespace means, attribute is the whole string
        // and we use ASC as the default sort type.
            attr = sortStr;
            sortType = 'ASC';
        } else {
            [attr, sortType] = _.split(sortStr, ' ');
            // upperCase sortType to be a bit more fault tollerant
            sortType = _.upperCase(sortType);
        }

        if (_.indexOf(allowedAttributes, attr) === -1) {
        // attr not in allowedAttributes array
            throw new Error('Illegal attribute: ' + attr);
        }

        let table = QueryUtils.getTableOfField(attr);
        if (sortType === 'ASC') {
            query.order('?.?', true, table, attr);
        } else if (sortType === 'DESC') {
            query.order('?.?', false, table, attr);
        } else {
            // Split it again to get un-uppercased sort type
            throw new Error('Illegal sort type: ' + _.split(sortStr, ' ')[1]);
        }
    });
};

/**
 * Determines in which table this column is. This works because all column names
 * use a prefix, which should be equivalent to the table name.
 * Eg: familyId => family, plantClonedFrom => plant
 * @param  {string} field
 *         column name. Eg. familyId, familyName, generationId, generationName,
 *         generationParent, genotypeId...
 * @return {string}
 *         Determined Table name
 */
QueryUtils.getTableOfField = function (field) {
    // determine which table we need
    let table;
    if (_.startsWith(field, 'plant')) {
        table = CONSTANTS.TABLE_PLANTS;
    } else if (_.startsWith(field, 'genotype')) {
        table = CONSTANTS.TABLE_GENOTYPES;
    } else if (field === 'generationParents') {
        table = CONSTANTS.TABLE_GENERATION_PARENTS;
    } else if (_.startsWith(field, 'generation')) {
        table = CONSTANTS.TABLE_GENERATIONS;
    } else if (_.startsWith(field, 'family')) {
        table = CONSTANTS.TABLE_FAMILIES;
    } else {
        throw new Error('cannot associate field with a table');
    }
    return table;
};
