'use strict';

const EnvironmentCreate = require('../controller/environment/environment-create');
const EnvironmentFind = require('../controller/environment/environment-find');
const EnvironmentDelete = require('../controller/environment/environment-delete');
const EnvironmentUpdate = require('../controller/environment/environment-update');

/**
 * Namespace containing all CRUD methods of Environment.
 * @namespace plantJournal.Environment
 * @memberof plantJournal
 */
let Environment = exports;

/**
 * @typedef {number} EnvironmentId
 *          Unique identifier for plants.
 */

/**
 * Creates a new environment record and returns the created environment object.
 * @memberof plantJournal.Environment
 * @async
 * @param {Object} options
 *         Options how the new environment should be.
 * @param {String} options.environmentName
 *        Name of this plant.
 * @param {String} [options.environmentDescription='']
 *        Description for this environment
 * @throws {Error}
 *         Will throw error if an unexpected sqlite error happens.
 * @return {Object} plantCreate
 * @return {Object.<EnvironmentId, EnvironmentObject>} plantCreate.plants
 *         Object holding information about created plant. This will only
 *         happen if no options.genotypId was set. There should
 *         only be one key, which is the id of the newly created plant.
 */
Environment.create = async function(options) {
    return await EnvironmentCreate.create(options);
};

/**
 * Searches for environments based on criteria and returns them.
 * @memberof plantJournal.Environment
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: environmentId, environmentName,
 *         environmentDescription, environmentCreatedAt, environmentModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFindEnvironment}
 *         Found environments
 */
Environment.find = async function(criteria) {
    return await EnvironmentFind.find(criteria);
};

Environment.delete = async function(criteria) {
    return await EnvironmentDelete.delete(criteria);
};

Environment.update = async function(update, criteria) {
    return await EnvironmentUpdate.update(update, criteria);
};
