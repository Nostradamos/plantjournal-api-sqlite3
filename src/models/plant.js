'use strict';

const PlantCreate = require('../controller/plant-create');
const PlantFind = require('../controller/plant-find');
const PlantDelete = require('../controller/plant-delete');
const PlantUpdate = require('../controller/plant-update');

let Plant = exports;

Plant.create = async function(options) {
  return await PlantCreate.create(options);
}

Plant.find = async function(criteria) {
  return await PlantFind.find(criteria);
}

Plant.delete = async function(criteria) {
  return await PlantDelete.delete(criteria);
}

/**
 * Update plants based on update and criteria.
 * This method allows you to update one or more plants.
 * With the criteria object you can search through all plants
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to Plant.find().
 * With update you can overwrite all fields except plantId,
 * plantCreatedAt, plantModifiedAt. plantModifiedAt
 * will be set to the current UTC timestamp for all updated plants.
 * If you want to know how Plant.update() works internally,
 * see src/controller/plant-update and src/controller/generic-update.
 * @async
 * @param  {Object}    update
 *         Fields to update.
 * @param  {String}    [update.plantName]
 *         Update plantName.
 * @param  {integer}   [update.plantClonedFrom]
 *         Update plantClonedFrom. Has to reference an existing plant, otherwise
 *         will throw error.
 * @param  {integer}   [update.genotypeId]
 *         Update genotypeId. Has to reference existing genotype.
 * @param  {Object}    criteria
 *         With Criteria you can control which plants should get updated.
 *         Behaves similiar to Plant.find().
 * @param  {integer}   [criteria.limit=10]
 *         Limit how many plants should get updated.
 * @param  {integer}   [criteria.offset=10]
 *         Skip the first x plant.
 * @param  {object}    [criteria.where]
 *         Where object to define more exactly which plants to update. For more
 *          information see Utils.setWhere.
 *          Allowed fields:
 *          familyId, familyName, familyCreatedAt, familyModifiedAt,
 *          generationId, generatioName, generationParents, generationCreatedAt,
 *          generationModifiedAt, genotypeId, genotypeName, genotypeCreatedAt,
 *          genotypeModifiedAt, plantId, plantName, plantClonedFrom,
 *          plantModifiedAt, plantClonedFrom
 * @returns {integer[]}
 *          Array of updated plantIds. Empty if no plants got updated.
 */
Plant.update = async function(update, criteria) {
  return await PlantUpdate.update(update, criteria);
}
