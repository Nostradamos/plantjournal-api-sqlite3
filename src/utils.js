'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');

const CONSTANTS = require('./constants');

/**
 * Utils.
 * @namespace
 */
let Utils = exports;

/**
 * Mutates obj to only contain non empty properties. You can limit it with
 * limitTo to specific properties.
 *
 * @param  {object} obj
 *         Object to delete from
 * @param  {array} [limitTo]
 *         Array of properties. If this is set, function will only delete empty
 *         properties where key is defined in this array.
 * @return {object}
 *         returns obj again (also mutates obj)
 */
Utils.deleteEmptyProperties = function deleteEmptyProperties(obj, limitTo) {
    if (_.isEmpty(limitTo)) limitTo = _.keys(obj);
    _(limitTo).filter(o => _.isEmpty(obj[o])).each(u => {
        _.unset(obj, u);
    });
    return obj;
};

/**
 * Adds to returnObject.families[row.familyId] the family object if
 * row.familyName is set. Mutates returnObject.
 * @param {object} row
 *        Row object from sqlite. row.familyId has to be set.
 * @param {object} returnObject
 *        Object which will find returned from
 *        pj.{Plant|Plant|Generation|...|Famiy}.find. Gets mutated.
 * @param {object} options
 *        options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
Utils.addFamilyFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let familyId = row.familyId;
    let family = {};

    _.each(CONSTANTS.ALL_ATTRIBUTES_FAMILY, function(attr) {
        if (_.has(row, attr)) family[attr] = row[attr];
    });

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
 * @param {object} options
 *        options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
Utils.addGenerationFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let generationId = row.generationId;
    let generation = {
        'familyId': row.familyId
    };

    _.each(CONSTANTS.ALL_ATTRIBUTES_GENERATION, function(attr) {
        if (_.has(row, attr)) {
            let rowattr = row[attr];
            // if we have row.generationParents and it's null, set an empty
            // array [], else split it into an array and cast every element to
            // an integer

            if (attr === 'generationParents') {
                if(rowattr === null) {
                    rowattr = [];
                } else {
                    rowattr =  _(rowattr).split(',').map(_.toInteger).value();
                }
            }
            generation[attr] = rowattr;
        }
    });
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
Utils.addGenotypeFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let genotypeId = row.genotypeId;
    let genotype = {
        'generationId': row.generationId,
        'familyId': row.familyId
    };

    _.each(CONSTANTS.ALL_ATTRIBUTES_GENOTYPE, function(attr) {
        if (_.has(row, attr)) genotype[attr] = row[attr];
    });
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
Utils.addPlantFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let plantId = row.plantId;

    let plant = {
        'genotypeId': row.genotypeId,
        'generationId': row.generationId,
        'familyId': row.familyId,
        'mediumId': row.mediumId || null,
        'environmentId': row.environmentId || null
    };

    _.each(CONSTANTS.ALL_ATTRIBUTES_PLANT, function(attr) {
        if (_.has(row, attr)) plant[attr] = row[attr];
    });

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
Utils.addEnvironmentFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let environmentId = row.environmentId;

    if(_.isUndefined(environmentId) || _.isNull(environmentId))
        return;

    let environment = {};

    _.each(CONSTANTS.ALL_ATTRIBUTES_ENVIRONMENT, function(attr) {
        if (_.has(row, attr)) environment[attr] = row[attr];
    });

    returnObject.environments[environmentId] = environment;
};

/**
 * Adds at many medium attributes as possible from row to
 * returnObject.mediums[mediumId].
 * @param {object} row
 *        Row object from sqlite. row.{mediumId} has to be set.
 * @param {object} returnObject
 *        Object which will contain information about found models.
 * @param {object} options
 *        options which got passed to the find function. For advanced use.
 * @param {bool}   [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
Utils.addMediumFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let mediumId = row.mediumId;
    let medium = {
        'environmentId': row.environmentId
    };

    _.each(CONSTANTS.ALL_ATTRIBUTES_MEDIUM, function(attr) {
        if (_.has(row, attr)) medium[attr] = row[attr];
    });

    if (forceAdd === true || _.size(medium) > 2)
        returnObject.mediums[mediumId] = medium;
};

Utils.addNeededFromRowToLogReturnObject = function(row, returnObject,
    attrLogTimestamp, attrLogId,
    allAttributes, plural,
    criteria) {
    let attributesToSelect;
    if(_.isEmpty(criteria.attributes)) {
        attributesToSelect = allAttributes;
    } else {
        attributesToSelect = _.intersection(
            criteria.attributes,
            allAttributes
        );
    }

    let logObject = {};
    for (let attr of attributesToSelect) {
        logObject[attr] = row[attr];
    }

    if(!_.has(returnObject[plural], row[attrLogTimestamp])) {
        returnObject[plural][row[attrLogTimestamp]] = {};
    }

    returnObject[plural][row[attrLogTimestamp]][row[attrLogId]] = logObject;
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
Utils.addFoundAndRemainingFromCountToReturnObject =
function (count, lenRows, returnObject, options) {
    let c = count['count'];

    returnObject['found'] = c;
    returnObject['remaining'] = c - lenRows - (options.offset || 0);
};

/**
 * Make sure obj is an assoc array/object with key/value pairs.
 * If not, throws an error.
 * @param  {Object}  obj
 *         Object to check
 * @param  {String}  [prefix='First argument']
 *         Name of object for error message.
 */
Utils.hasToBeAssocArray = function (obj, prefix = 'First argument') {
    if (!_.isObjectLike(obj) || _.isArray(obj)) {
        throw new Error(prefix + ' has to be an associative array');
    }
};

/**
 * Make sure obj.property is a string. If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be a
 *                                      String
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeString = function hasToBeString(obj, property, name = 'options') {
    if (_.has(obj, property) && !_.isString(obj[property])) {
        throw new Error(name + '.' + property + ' has to be a string');
    }
};

/**
 * Make sure obj.property is an integer. If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be an
 *                                      int
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeInt = function hasToBeInt(obj, property, name = 'options') {
    if (_.has(obj, property) && !_.isInteger(obj[property])) {
        throw new Error(name + '.' + property + ' has to be an integer');
    }
};

Utils.hasToBeIntOrNull = function hasToBeInt(obj, property, name = 'options') {
    let value = obj[property];
    if (!_.isInteger(value) && !_.isNull(value)) {
        throw new Error(
            name + '.' + property + ' has to be an integer or null');
    }
};

/**
 * Make sure obj.property is an array only consisting of integers.
 * If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be an
 *                                      array of integers
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeIntArray = function (obj, property, name = 'options') {
    let value = obj[property];
    if(_.isUndefined(value)) return;
    if (!_.isArray(value) || !_.every(value, _.isInteger)) {
        throw new Error(
            name + '.' + property + ' has to be an array of integers');
    }
};

/**
 * Make sure obj.property is set, and if not, throw an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be set
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeSet = function hasToBeSet(obj, property, name = 'options') {
    if (!_.has(obj, property)) {
        throw new Error(name + '.' + property + ' has to be set');
    }
};

/**
 * Return a unix timestamp (seconds)
 * @return {UnixTimestampUTC} Unix Timestamp
 */
Utils.getUnixTimestampUTC = function getUnixTimestampUTC() {
    return Math.floor(new Date() / 1000);
};

/**
 * Converts Set to array and filters out null. Mutates set.
 * @param  {Set} set - Set to filter and convert
 * @return {Array}   - Arrayfied set without null elements
 */
Utils.filterSetNotNull = function filterSetNotNull(set) {
    set.delete(null);
    return Array.from(set);
};

/**
 * Checks if we are connected to sqlite database. If not, throws error.
 * @throws {Error}
 */
Utils.throwErrorIfNotConnected = function() {
    if (sqlite.driver != null && sqlite.driver.open === true) {
        return;
    }
    throw Error('plantJournal is not connected to database.');
};
