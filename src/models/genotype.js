'use strict';

const GenotypeCreate = require('../controller/genotype-create');
const GenotypeFind = require('../controller/genotype-find');
const GenotypeDelete = require('../controller/genotype-delete');
const GenotypeUpdate = require('../controller/genotype-update');

/**
 * Namespace containing all CRUD methods for Genotype.
 * @namespace plantJournal.Genotype
 * @memberof plantJournal
 */
let Genotype = exports;

 /**
  * Creates a new Genotype entry and returns the created genotype object.
  * @memberof plantJournal.Genotype
  * @async
  * @param  {Object} options
  *         Options how the new family should be.
  * @param  {String} options.genotypeName
  *         Name for the new genotype.
  * @param  {integer} options.generationId
  *         If of generation this genotype is in.
  * @throws {Error}
  *         Will throw error if generationId is invalid or if an unexpected
  *         sqlite error happens.
  * @return {Genotype}
  *         The newly created Genotype object
  */
Genotype.create = async function(options) {
  return await GenotypeCreate.create(options);
}

Genotype.find = async function(criteria) {
  return await GenotypeFind.find(criteria);
}

Genotype.delete = async function(criteria) {
  return await GenotypeDelete.delete(criteria);
}

 /**
  * Update Genotypes based on update and criteria.
  * This method allows you to update one or more genotypes.
  * With the criteria object you can search through all genotypes
  * and pick the ones you want to update. It behaves similiar (but not
  * equal) to Genotype.find().
  * With update you can overwrite all fields except genotpeId,
  * genotypeCreatedAt, genotypeModifiedAt. genotypeModifiedAt
  * will be set to the current UTC timestamp for all updated genotypes.
  * If you want to know how Genotype update works internally,
  * see src/controller/genotype-update and src/controller/generic-update.
  * @memberof plantJournal.Genotype
  * @async
  * @param  {Object}    update
  *         Fields to update.
  * @param  {String}    [update.genotypeName]
  *         Update generationParents.
  * @param  {GenerationId}   [update.generationId]
  *         Update generationId. This has to be an existing GenerationId,
  *         otherwise we will throw an errror.
  * @param  {Object}    criteria
  *         With Criteria you can control which genotypes should get updated.
  *         Behaves similiar to Genotype.find()
  * @param  {integer}   [criteria.limit=10]
  *         Limit how many genotypes should get updated.
  * @param  {integer}   [criteria.offset=10]
  *         Skip the first x genotypes
  * @param  {object}    [criteria.where]
  *         Where object to define more exactly which genotypes to update. For
  *         more information see Utils.setWhere().
  *         Allowed fields:
  *         familyId, familyName, familyCreatedAt, familyModifiedAt,
  *         generationId, generatioName, generationParents, generationCreatedAt,
  *         generationModifiedAt, genotypeId, genotypeName
  * @returns {GenotypeId[]}
  *          Array of updated genotypeIds. Empty if no genotypes got updated.
  */
Genotype.update = async function(update, criteria) {
  return await GenotypeUpdate.update(update, criteria);
}
