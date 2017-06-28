'use strict';

const GenotypeCreate = require('../controller/genotype-create');
const GenotypeFind = require('../controller/genotype-find');
const GenotypeDelete = require('../controller/genotype-delete');
const GenotypeUpdate = require('../controller/genotype-update');

let Genotype = exports;


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
  * @async
  * @param  {Object}    update                 - Fields to update
  * @param  {String}    [update.genotypeName]  - Update generationParents
  * @param  {integer}   [update.generationId]  - Update generationId
  * @param  {Object}    criteria               - With Criteria you can control
  *                                              which genotypes should get
  *                                              updated. Behaves similiar
  *                                              to Genotype.find()
  * @param  {integer}   [criteria.limit=10]    - Limit how many genotypes should
  *                                              get updated
  * @param  {integer}   [criteria.offset=10]   - Skip the first x genotypes
  * @param  {object}    [criteria.where]       - Where object to define
  *                                              more exactly which genotypes
  *                                              to update. For more
  *                                              information see
  *                                              Utils.setWhere.
  *                                              Allowed fields:
  *                                              - familyId
  *                                              - familyName,
  *                                              - familyCreatedAt
  *                                              - familyModifiedAt
  *                                              - generationId
  *                                              - generatioName
  *                                              - generationParents
  *                                              - generationCreatedAt
  *                                              - generationModifiedAt
  *                                              - genotypeId
  *                                              - genotypeName
  * @returns {integer[]} - Array of updated genotypeIds. Empty if no generations
  *                        got updated.
  * @throws {Error}
  */
Genotype.update = async function(update, criteria) {
  return await GenotypeUpdate.update(update, criteria);
}
