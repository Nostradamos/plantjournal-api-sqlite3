'use strict';

const GenerationCreate = require('./generation/generation-create');
const GenerationFind = require('./generation/generation-find');
const GenerationDelete = require('./generation/generation-delete');
const GenerationUpdate = require('./generation/generation-update');


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
 * @property {FamilyId} familyId
 *           The familyId this family is member of.
 * @property {UnixTimestampUTC} generationCreatedAt
 *           UTC Timestamp when this generation got created.
 * @property {UnixTimestampUTC} generationModifiedAt
 *           UTC Timestamp when this generation got modified the last time.
 */

/**
 * @typedef {Object} ReturnCreateFamily
 * @todo This will may be change
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
 * @return {Object} generationCreate
 * @return {Object.<GenerationId, GenerationObject>} ge...onCreate.generations
 *         Object holding information about created generation. There should
 *         only be one key, which is the id of the newly created generation.
 */
Generation.create = async function(options) {
  return await GenerationCreate.create(options);
};

/**
 * Find generations based on criteria and returns them. You can select the
 * generations to return based on various so called criterias.
 * Queryable Fields: familyId, familyName, familyCreatedAt, familyModifiedAt,
 * generationId, generationIdName, generationCreatedAt, generationModifiedAt
 *
 * @memberof plantJournal.Generation
 * @async
 * @param {criteria} criteria
 *        Control which generations you want to search for.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing information about found generations and related
 *         families. Only .generations and maybe .families will be set.
 */
Generation.find = async function(criteria) {
  return await GenerationFind.find(criteria);
};

/**
 * Deletes generations and related genotypes and plants based on criteria.
 * Returns which model record ids got deleted.
 * @memberof plantJournal.Generation
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which generations you want
 *         to delete. Queryable Attributes: familyId, familyName,
 *         familyCreatedAt, familyModifiedAt, generationId, generationName,
 *         generationModifiedAt, generationCreatedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnGenerationDelete
 *         Object containing info about all deleted records from the different
 *         models.
 *         Not all child arrays have to be set if no related model records were
 *         found.
 * @return {GenerationId[]} returnGenerationDelete.generations
 *         Array containing all deleted generation ids.
 * @return {GenotypeId[]} returnGenerationDelete.genotypes
 *         Array containing all deleted genotye ids.
 * @return {PlantId[]} returnGenerationDelete.plants
 *         Array containing all deleted plant ids.
 */
Generation.delete = async function(criteria) {
  return await GenerationDelete.delete(criteria);
};

/**
 * Update Generations based on update and criteria.
 * This method allows you to update one or more generations.
 * With the criteria object you can search through all generations
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to Generation.find().
 * With update you can overwrite all attributes except generationId,
 * generationCreatedAt, generationModifiedAt, parentId. generationModifiedAt
 * will be set to the current UTC timestamp for all updated generations.
 * If you want to know how generation update works internally,
 * see src/controller/generation-update and src/controller/generic-update.
 * @async
 * @param  {Object}    update
 *         Fields to update
 * @param  {String}    [update.generationName]
 *         Set generationName of all generations to update to this value.
 * @param  {PlantId[]} [update.generationParents]
 *         Update the parents of all generations to update to the plantIds
 *         in this array. Will throw error if any of the integers does not
 *         represent an existing Plant.
 * @param  {FamilyId}   [update.familyId]
 *         Update the familyId. Will throw error if this is invalid.
 * @param  {Criteria}    criteria
 *         With Criteria you can control which generations should get updated.
 *         Behaves similiar to Generation.find().
 * @returns {GenotypeId[]}
 *          Array of updated generationIds. Empty if no generations got updated.
 * @throws {Error}
 *         Should only throw error if unexpected sqlite error happend.
 */
Generation.update = async function(update, criteria) {
  return await GenerationUpdate.update(update, criteria);
};
