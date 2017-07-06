'use strict';

const GenerationCreate = require('../controller/generation-create');
const GenerationFind = require('../controller/generation-find');
const GenerationDelete = require('../controller/generation-delete');
const GenerationUpdate = require('../controller/generation-update');


/**
 * Generation namspace holds all CRUD methods for Family.
 * @namespace plantJournal.Generation
 * @memberof plantJournal
 */
let Generation = exports;

/**
 * @typedef {number} GenerationId
 *          Unique Identifier for a generation.
 */

/**
 * @typedef {Object} GenerationObject
 * @property {GenerationId} generationId
 *           The unique identifier of this generations.
 * @property {String} generationName
 *           Name of this generation.
 * @property {number} generationIdId
 *           The generationIdId this generation refers to.
 * @property {number} generationCreatedAt
 *           UTC Timestamp when this generation got created.
 * @property {number} generationModifiedAt
 *           UTC Timestamp when this generation got modified the last time.
 */

/**
 * Creates a new Generation and returns the newly created Generation object.
 * With options you can set the different values for the new generation
 * like name or generationId it's in.
 * @memberof plantJournal.Generation
 * @async
 * @param  {Object} options
 *         Options object. With this you can define how the new Generation
 *         should be.
 * @param  {String} options.generationName
 *         Name for this generation.
 * @param  {FamilyId} options.familyId
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

/**
 * Find generations based on criteria and returns them. You can select the generations
 * to return based on various so called criterias.
 * Queryable Fields: familyId, familyName, familyCreatedAt, familyModifiedAt,
 * generationId, generationIdName, generationCreatedAt, generationModifiedAt
 *
 * @memberof plantJournal.Generation
 * @async
 * @param  {Object} [criteria]
 *         Criteria object. With this you can control which generations you want
 *         to return.
 * @param  {String[]} [criteria.fields]
 *         Define which fields you want to return. By default all available.
 * @param  {Object} [criteria.where]
 *         See Utils.setWhere how to use this. Small example:
 *         where: {generationIdId: [1,2,3]} => where generationIdId is either
 *         1,2 or 3.
 *         where: {generationIdName: 'TestFamily2'} => where generationIdName is
 *         TestFamily2.
 * @param  {integer} [criteria.limit=10]
 *         Limit how many generations should get find (and returned).
 * @param  {integer} [criteria.offset=0]
 *         Skip the first x generations. Needed for paging.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 *
 * @return {Object} foundGenerations
 *         Object containing all information about found generations.
 * @return {integer} foundGenerations.count
 *         How many generations where found in total. If you don't search for
 *         specific generations, this will be the amount of all generations we know.
 *         Otherwise how many generations where found matching that search. Not all
 *         of them have to be returned by now, but with offset/limit you could
 *         get all of them. Useful for paging.
 * @return {integer} foundGenerations.remaining
 *         Indicates how many generations are remaining for this search. This is
 *         useful for paging. Imagine you have 10 generations, and with limit=2
 *         you get only the first to. There would be still 8 remaining.
 *         With offset=2 you would get the next 2 (generationId 2-4) and 6 would
 *         be remaining.
 * @return {Object.<FamilyId, Family>} foundGenerations.families
 *         All families related to generations. You can select which attributes
 *         you want with criteria.fields.
 * @return {Object.<GenerationId, Generation>} foundGenerations.generations
 *         The actual generations. Key is always the generationIdId to make it
 *         easier to get a generationId with a specific key out of the object.
 *         Value will be also an object, but filled with information/
 *         generationId attributes
 *         about one single generationId. See jsdoc Family object description.
 */
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
 * @param  {integer}   [update.generationIdId]
 *         Update the generationIdId. Will throw error if this is invalid.
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
 *         Allowed fields: generationIdId, generationIdName, generationIdCreatedAt,
 *         generationIdModifiedAt, generationId, generatioName, generationParents,
 *         generationCreatedAt, generationModifiedAt.
 * @returns {GenotypeId[]}
 *          Array of updated generationIds. Empty if no generations got updated.
 * @throws {Error}
 *         Should only throw error if unexpected sqlite error happend.
 */
Generation.update = async function(update, criteria) {
  return await GenerationUpdate.update(update, criteria);
}
