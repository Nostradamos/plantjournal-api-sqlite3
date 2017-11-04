'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');

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
Utils.deleteEmptyProperties = function(obj, limitTo) {
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
 * @param {bool} [forceAdd=false]
 *        adds to returnObject even if row.generatioName is not set.
 */
Utils.addFamilyFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let familyId = row.familyId;
    let family = {};

    let value;
    for (let attr of CONSTANTS.ALL_ATTRIBUTES_FAMILY) {
        if (!_.has(row, attr)) continue;
        value = row[attr];
        if (attr === CONSTANTS.ATTR_GENERATIONS_FAMILY) {
            value = Utils.splitToInt(value);
        }
        family[attr] = value;
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
Utils.addGenerationFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let generationId = row.generationId;
    let generation = {
        'familyId': row.familyId
    };

    for(let attr of CONSTANTS.ALL_ATTRIBUTES_GENERATION) {
        if (!_.has(row, attr)) continue;

        let value = row[attr];
        if (attr === CONSTANTS.ATTR_PARENTS_GENERATION ||
            attr === CONSTANTS.ATTR_GENOTYPES_GENERATION) {
            value = Utils.splitToInt(value);
        }
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
Utils.addGenotypeFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let genotypeId = row.genotypeId;
    let genotype = {
        [CONSTANTS.ATTR_ID_GENOTYPE]: row.generationId,
        [CONSTANTS.ATTR_ID_FAMILY]: row.familyId
    };

    let value;
    for(let attr of CONSTANTS.ALL_ATTRIBUTES_GENOTYPE) {
        if (!_.has(row, attr)) continue;
        value = row[attr];

        if(attr === CONSTANTS.ATTR_PLANTS_GENOTYPE) {
            value = Utils.splitToInt(value);
        }

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
Utils.addPlantFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let plantId = row.plantId;

    let plant = {
        'genotypeId': row.genotypeId,
        'generationId': row.generationId,
        'familyId': row.familyId,
        'mediumId': row.mediumId || null,
        'environmentId': row.environmentId || null
    };

    let value;
    for (let attr of CONSTANTS.ALL_ATTRIBUTES_PLANT) {
        if (!_.has(row, attr)) continue;
        value = row[attr];

        if(attr === CONSTANTS.ATTR_CLONES_PLANT) {
            value = Utils.splitToInt(value);
        }

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
Utils.addEnvironmentFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let environmentId = row.environmentId;

    if(_.isUndefined(environmentId) || _.isNull(environmentId))
        return;

    let environment = {};

    let value;
    for(let attr of CONSTANTS.ALL_ATTRIBUTES_ENVIRONMENT) {
        if (!_.has(row, attr)) continue;
        value = row[attr];

        if(attr === CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT) {
            value = Utils.splitToInt(value);
        }
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
Utils.addMediumFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let mediumId = row.mediumId;
    let medium = {
        'environmentId': row.environmentId
    };

    let value;
    for(let attr of CONSTANTS.ALL_ATTRIBUTES_MEDIUM) {
        if (!_.has(row, attr)) continue;
        value = row[attr];

        if(attr === CONSTANTS.ATTR_PLANTS_MEDIUM) {
            value = Utils.splitToInt(value);
        }

        medium[attr] = value;
    }

    if (forceAdd === true || _.size(medium) > 2)
        returnObject.mediums[mediumId] = medium;
};

Utils.addJournalFromRowToReturnObject = (row, returnObject, forceAdd) => {
    let journalId = row.journalId;
    let journal = {};

    let value;
    for (let attr of CONSTANTS.ALL_ATTRIBUTES_JOURNAL) {
        if (!_.has(row, attr)) continue;
        value = row[attr];
        let isForeignAttr = _.indexOf(
            [
                CONSTANTS.ATTR_ID_ENVIRONMENT,
                CONSTANTS.ATTR_ID_MEDIUM,
                CONSTANTS.ATTR_ID_PLANT
            ], attr);
        if (value === null && isForeignAttr !== -1) continue;
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
Utils.addFoundAndRemainingFromCountToReturnObject =
function (count, lenRows, returnObject, options) {
    let found = count['count'];
    let offset = options.offset || 0;
    let remaining = found - offset - lenRows;

    // Make sure we don't go negative
    if(remaining < 0) remaining = 0;

    returnObject['found'] = found;
    returnObject['remaining'] = remaining;
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
Utils.hasToBeString = function(obj, property, name = 'options') {
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
Utils.hasToBeInt = function(obj, property, name = 'options') {
    if (_.has(obj, property) && !_.isInteger(obj[property])) {
        throw new Error(name + '.' + property + ' has to be an integer');
    }
};

Utils.hasToBeIntOrNull = function(obj, property, name = 'options') {
    let value = obj[property];
    if (!_.isUndefined(value) && !_.isInteger(value) && !_.isNull(value)) {
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
Utils.hasToBeIntArray = function(obj, property, name = 'options') {
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
Utils.hasToBeSet = function(obj, property, name = 'options') {
    if (!_.has(obj, property)) {
        throw new Error(name + '.' + property + ' has to be set');
    }
};

/**
 * Return a unix timestamp (seconds)
 * @return {UnixTimestampUTC} Unix Timestamp
 */
Utils.getUnixTimestampUTC = function() {
    return Math.floor(new Date() / 1000);
};

/**
 * Converts Set to array and deletes null from it before. Mutates set.
 * @param  {Set} set - Set to where and convert
 * @return {Array}   - Arrayfied set without null elements
 */
Utils.whereSetNotNull = function(set) {
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

Utils.isValidJSON = function(str) {
    try {
        JSON.parse(str);
    } catch(err) {
        return false;
    }
    return true;
};

Utils.explicitColumn = function(table, column) {
    return table + '.' + column;
};

Utils.explicitColumnRstr = function(table, column) {
    return squel.rstr(Utils.explicitColumn(table, column));
};

/**
 * Split a string of numbers seperated by "," (or any other seperator) into
 * an array of integers.
 * @param  {String|null} str
 *         A string with numbers (which can get casted to integer) seperated by
 *         a comma. Or null.
 * @param  {String} [sep=',']
 *         Seperator
 * @return {Integer[]}
 *         Integer array, if string is empty or null, array will be emtpy too.
 */
Utils.splitToInt = function(str, sep = ',') {
    return str === null ? [] : _(str).split(sep).map(_.toInteger).value();
};
