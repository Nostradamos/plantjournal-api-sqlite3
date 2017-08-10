'use strict';

const PlantCreate = require('../controller/plant/plant-create');
const PlantFind = require('../controller/plant/plant-find');
const PlantDelete = require('../controller/plant/plant-delete');
const PlantUpdate = require('../controller/plant/plant-update');

/**
 * Namespace containing all CRUD methods of Plant.
 * @namespace plantJournal.Plant
 * @memberof plantJournal
 */
let Plant = exports;

/**
 * @typedef {number} PlantId
 *          Unique identifier for plants.
 */

/**
 * @typedef {String} PlantSex
 *          Has to be either male, female or hermaphrodite.
 */

/**
 * @typedef {Object} Plant
 * @property {PlantId} plantId
 *           Unique Identifier for this plant.
 * @property {String} plantName
 *           Name of this plant.
 * @property {PlantId} [plantClonedFrom=null]
 *           If plant got cloned from another plant, this will be the id of
 *           the mother plant.
 * @property {PlantSex} plantSex
 *           Sex of this plant.
 * @property {GenotypeId} genotypeId
 * @property {UnixTimestampUTC} plantCreatedAt
 *           UTC Timestamp when this plant got created.
 * @property {UnixTimestampUTC} plantModifiedAt
 *           UTC Timestamp when this plant got modified the last time.
 */


/**
 * Creates a new plant entry and returns the created plant object. If
 * options.genotypeId is not set, this will automatically create a new
 * genotype.
 * @memberof plantJournal.Plant
 * @async
 * @param {Object} options
 *         Options how the new plant should be.
 * @param {String} options.plantName
 *        Name of this plant.
 * @param {PlantId} [options.plantClonedFrom=null]
 *        If plant got cloned from another plant, this will be the id of
 *        the mother plant.
 * @param {plantSex} options.plantSex
 *        Sex of this plant.
 * @param {GenotypeId} [options.genotypeId]
 *        ID of genotype this plant has. If not set, a new genotype will
 *        get created.
 * @throws {Error}
 *         Will throw error if genotypeId is invalid or if an unexpected
 *         sqlite error happens.
 * @return {Object} plantCreate
 * @return {Object.<PlantId, PlantObject>} plantCreate.plants
 *         Object holding information about created plant. This will only
 *         happen if no options.genotypId was set. There should
 *         only be one key, which is the id of the newly created plant.
 * @return {Object.<GenotypeId, GenotypeObject>} plantCreate.genotypes
 *         Object holding information about created genotype. This will only
 *         happen if no options.genotypId was set. There should
 *         only be one key, which is the id of the newly created genotype.
 */
Plant.create = async function(options) {
    return await PlantCreate.create(options);
};

/**
 * Find plants based on criteria and returns them. You can select the plants
 * to return based on various so called criterias.
 * @memberof plantJournal.Plant
 * @async
 * @param {criteria} criteria
 *        Control which plants you want to search for.
 *        Queryable attributes:
 *        familyId, familyName, familyCreatedAt, familyModifiedAt,
 *        generationId, generatioName, generationParents, generationCreatedAt,
 *        generationModifiedAt, genotypeId, genotypeName, genotypeCreatedAt,
 *        genotypeModifiedAt, plantId, plantName, plantClonedFrom,
 *        plantModifiedAt, plantClonedFrom
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing information about found plants. Only .plants
 *         should be set.
 */
Plant.find = async function(criteria) {
    return await PlantFind.find(criteria);
};

/**
 * Deletes plants based on criteria.
 * Returns which plant ids got deleted.
 * @memberof plantJournal.Plant
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which genotypes you want
 *         to delete.
 *         Queryable attributes:
 *         familyId, familyName, familyCreatedAt, familyModifiedAt,
 *         generationId, generatioName, generationParents, generationCreatedAt,
 *         generationModifiedAt, genotypeId, genotypeName, genotypeCreatedAt,
 *         genotypeModifiedAt, plantId, plantName, plantClonedFrom,
 *         plantModifiedAt, plantClonedFrom
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnPlantDelete
 *         Object containing info about all deleted records from the different
 *         models.
 * @return {PlantId[]} returnPlantDelete.plants
 *         Array containing all deleted plant ids.
 */
Plant.delete = async function(criteria) {
    return await PlantDelete.delete(criteria);
};

/**
 * Update plants based on update and criteria.
 * This method allows you to update one or more plants.
 * With the criteria object you can search through all plants
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to Plant.find().
 * With update you can overwrite all attributes except plantId,
 * plantCreatedAt, plantModifiedAt. plantModifiedAt
 * will be set to the current UTC timestamp for all updated plants.
 * If you want to know how Plant.update() works internally,
 * see src/controller/plant-update and src/controller/generic-update.
 * @memberof plantJournal.Plant
 * @async
 * @param  {Object}    update
 *         Fields to update.
 * @param  {String}    [update.plantName]
 *         Update plantName.
 * @param  {PlantId}   [update.plantClonedFrom]
 *         Update plantClonedFrom. Has to reference an existing plant, otherwise
 *         will throw error.
 * @param  {GenotypeId}   [update.genotypeId]
 *         Update genotypeId. Has to reference existing genotype.
 * @param  {Criteria}    criteria
 *         With Criteria you can control which plants should get updated.
 *         Behaves similiar to Plant.find().
 *         Queryable attributes:
 *         familyId, familyName, familyCreatedAt, familyModifiedAt,
 *         generationId, generatioName, generationParents, generationCreatedAt,
 *         generationModifiedAt, genotypeId, genotypeName, genotypeCreatedAt,
 *         genotypeModifiedAt, plantId, plantName, plantClonedFrom,
 *         plantModifiedAt, plantClonedFrom
 * @return {PlantId[]}
 *          Array of updated plantIds. Empty if no plants got updated.
 */
Plant.update = async function(update, criteria) {
    return await PlantUpdate.update(update, criteria);
};
