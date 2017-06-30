'use strict';

const GenerationCreate = require('../controller/generation-create');
const GenerationFind = require('../controller/generation-find');
const GenerationDelete = require('../controller/generation-delete');
const GenerationUpdate = require('../controller/generation-update');

let Generation = exports;

/**
 * @typedef {Object} Generation
 * @property {number} generationId
 *           The unique identifier of this generations.
 * @property {String} generationName
 *           Name of this generation.
 * @property {number} familyId
 *           The familyId this generation refers to.
 * @property {number} generationCreatedAt
 *           UTC Timestamp when this generation got created.
 * @property {number} generationModifiedAt
 *           UTC Timestamp when this generation got modified the last time.
 */

/**
 * Creates a new Generation and returns the newly created Generation object.
 * With options you can set the different values for the new generation
 * like name or family it's in.
 * @async
 * @param  {Object} options
 *         Options object. With this you can define how the new Generation
 *         should be.
 * @param  {String} options.generationName
 *         Name for this generation.
 * @param  {integer} options.familyId
 *         Unique Identifier of the family this generation should be in.
 *         Will throw error if this id is invalid.
 * @throws {Error}
 *         Should throw error if famiylId is invalid or unexpected sqlite
 *         error happens (eg: database connection is broken)
 * @return {Generation}
 */
Generation.create = async function(options) {
  return await GenerationCreate.create(options);
}

Generation.find = async function(criteria) {
  return await GenerationFind.find(criteria);
}

Generation.delete = async function(criteria) {
  return await GenerationDelete.delete(criteria);
}

/**
 * Update Generations based on update and criteria.
 * This method allows you to update one or more generations.
 * With the criteria object you can search through all generations
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to Generation.find().
 * With update you can overwrite all fields except generationId,
 * generationCreatedAt, generationModifiedAt, parentId. generationModifiedAt
 * will be set to the current UTC timestamp for all updated generations.
 * If you want to know how generation update works internally,
 * see src/controller/generation-update and src/controller/generic-update.
 * @async
 * @param  {Object}    update
 *         Fields to update
 * @param  {String}    [update.generationName]
 *         Set generationName of all generations to update to this value.
 * @param  {integer[]} [update.generationParents]
 *         Update the parents of all generations to update to the plantIds
 *         in this array. Will throw error if any of the integers does not
 *         represent an existing Plant.
 * @param  {integer}   [update.familyId]
 *         Update the familyId. Will throw error if this is invalid.
 * @param  {Object}    criteria
 *         With Criteria you can control which generations should get updated.
 *         Behaves similiar to Generation.find().
 * @param  {integer}   [criteria.limit=10]
 *         Limit how many generations should get updated.
 * @param  {integer}   [criteria.offset=10]
 *         Skip the first x generations.
 * @param  {object}    [criteria.where]
 *         Where object to define more exactly which generations to update.
 *         For more information see Utils.setWhere().
 *         Allowed fields: familyId, familyName, familyCreatedAt,
 *         familyModifiedAt, generationId, generatioName, generationParents,
 *         generationCreatedAt, generationModifiedAt.
 * @returns {integer[]} - Array of updated generationIds. Empty if no generations
 *                        got updated.
 * @throws {Error}
 *         Should only throw error if unexpected sqlite error happend.
 */
Generation.update = async function(update, criteria) {
  return await GenerationUpdate.update(update, criteria);
}
