'use strict';

const GenotypeCreate = require('../controller/genotype/genotype-create');
const GenotypeFind = require('../controller/genotype/genotype-find');
const GenotypeDelete = require('../controller/genotype/genotype-delete');
const GenotypeUpdate = require('../controller/genotype/genotype-update');

/**
 * Namespace containing all CRUD methods for Genotype.
 * @namespace plantJournal.Genotype
 * @memberof plantJournal
 */
let Genotype = exports;

/**
 * @typedef {number} GenotypeId
 *          Unique Identifier for a genotype record.
 */

/**
 * @typedef {Object} GenotypeObject
 * @property {GenotypeId} genotypeId
 *           The unique identifier of this genotype record.
 * @property {String} genotypeName
 *           Name of this genotype.
 * @property {genotypeId} genotypeId
 *           The genotypeId this genotype is in.
 * @property {UnixTimestampUTC} genotypeCreatedAt
 *           UTC Timestamp when this genotype got created.
 * @property {UnixTimestampUTC} genotypeModifiedAt
 *           UTC Timestamp when this genotype got modified the last time.
 */



/**
 * Creates a new Genotype entry and returns the created genotype object.
 * @memberof plantJournal.Genotype
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {String} options.genotypeName
 *         Name for the new genotype.
 * @param  {integer} options.genotypeId
 *         If of genotype this genotype is in.
 * @throws {Error}
 *         Will throw error if genotypeId is invalid or if an unexpected
 *         sqlite error happens.
 * @return {Object} genotypeCreate
 * @return {Object.<genotypeId, genotypeObject>} genotypeCreate.genotypes
 *         Object holding information about created genotype. There should
 *         only be one key, which is the id of the newly created genotype.
 */
Genotype.create = async function(options) {
    return await GenotypeCreate.create(options);
};

/**
 * Find genotypes based on criteria and returns them. You can select the genotypes
 * to return based on various so called criterias.
 * @memberof plantJournal.Genotype
 * @async
 * @param {criteria} criteria
 *        Control which genotypes you want to search for.
 *        Queryable Fields: familyId, familyName, familyCreatedAt,
 *        familyModifiedAt, generationId, generationIdName,
 *        generationCreatedAt, generationModifiedAt, genotypeId, genotypeName,
 *        genotypeCreatedAt, genotypeModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing information about found genotypes and related
 *         families. Only .genotypes and maybe .generations and genotypes will
 *         be set.
 */
Genotype.find = async function(criteria) {
    return await GenotypeFind.find(criteria);
};

/**
 * Deletes genotypes and related plants based on criteria.
 * Returns which model record ids got deleted.
 * @memberof plantJournal.Genotype
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which genotypes you want
 *         to delete. Queryable Fields: familyId, familyName, familyCreatedAt,
 *         familyModifiedAt, generationId, generationIdName,
 *         generationCreatedAt, generationModifiedAt, genotypeId, genotypeName,
 *         genotypeCreatedAt, genotypeModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnGenotypeDelete
 *         Object containing info about all deleted records from the different
 *         models.
 *         Not all child arrays have to be set if no related model records were
 *         found.
 * @return {GenotypeId[]} returnGenotypeDelete.genotypes
 *         Array containing all deleted genotye ids.
 * @return {PlantId[]} returnGenotypeDelete.plants
 *         Array containing all deleted plant ids.
 */
Genotype.delete = async function(criteria) {
    return await GenotypeDelete.delete(criteria);
};

/**
 * Update Genotypes based on update and criteria.
 * This method allows you to update one or more genotypes.
 * With the criteria object you can search through all genotypes
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to Genotype.find().
 * With update you can overwrite all attributes except genotpeId,
 * genotypeCreatedAt, genotypeModifiedAt. genotypeModifiedAt
 * will be set to the current UTC timestamp for all updated genotypes.
 * If you want to know how Genotype update works internally,
 * see src/controller/genotype-update and src/controller/generic-update.
 * @memberof plantJournal.Genotype
 * @async
 * @param  {Object}    update
 *         Fields to update.
 * @param  {String}    [update.genotypeName]
 *         Update genotypeParents.
 * @param  {GenerationId}   [update.generationId]
 *         Update generationId. This has to be an existing generationId,
 *         otherwise we will throw an errror.
 * @param  {Criteria}    criteria
 *         With Criteria you can control which genotypes should get updated.
 * @returns {GenotypeId[]}
 *          Array of updated genotypeIds. Empty if no genotypes got updated.
 */
Genotype.update = async function(update, criteria) {
    return await GenotypeUpdate.update(update, criteria);
};
