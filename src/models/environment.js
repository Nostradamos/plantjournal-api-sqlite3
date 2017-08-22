'use strict';

const EnvironmentCreate = require('../controller/environment/environment-create');

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
