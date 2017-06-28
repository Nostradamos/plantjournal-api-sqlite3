'use strict';

const GenerationCreate = require('../controller/generation-create');
const GenerationFind = require('../controller/generation-find');
const GenerationDelete = require('../controller/generation-delete');
const GenerationUpdate = require('../controller/generation-update');

let Generation = exports;

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
 * @param  {Object}    update                     - Fields to update
 * @param  {String}    [update.generationName]    - Update generationName
 * @param  {integer[]} [update.generationParents] - Update generationParents
 * @param  {integer}   [update.familyId]          - Update familyId
 * @param  {Object}    criteria                   - With Criteria you can control
 *                                                  which generations should get
 *                                                  updated. Behaves similiar
 *                                                  to Generation.find()
 * @param  {integer}   [criteria.limit=10]        - Limit how many generations should
 *                                                  get updated
 * @param  {integer}   [criteria.offset=10]       - Skip the first x generations
 * @param  {object}    [criteria.where]           - Where object to define
 *                                                  more exactly which generations
 *                                                  to update. For more
 *                                                  information see
 *                                                  Utils.setWhere.
 *                                                  Allowed fields:
 *                                                  - familyId
 *                                                  - familyName,
 *                                                  - familyCreatedAt
 *                                                  - familyModifiedAt
 *                                                  - generationId
 *                                                  - generatioName
 *                                                  - generationParents
 *                                                  - generationCreatedAt
 *                                                  - generationModifiedAt
 * @returns {integer[]} - Array of updated generationIds. Empty if no generations
 *                        got updated.
 * @throws {Error}
 */
Generation.update = async function(update, criteria) {
  return await GenerationUpdate.update(update, criteria);
}
