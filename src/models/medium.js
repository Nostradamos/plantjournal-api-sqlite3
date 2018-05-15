'use strict';

const MediumAdd = require('./medium/medium-add');
const MediumFind = require('./medium/medium-find');
const MediumDelete = require('./medium/medium-delete');
const MediumUpdate = require('./medium/medium-update');

/**
 * Namespace containing all CRUD methods of Medium.
 * @namespace plantJournal.Medium
 * @memberof plantJournal
 */
let Medium = exports;

/**
 * @typedef {number} MediumId
 *          Unique identifier for plants.
 */

/**
  * @typedef {Object} MediumObject
  *          Object containing all information specific to this medium.
  * @property {mediumId} [mediumId]
  *           Unique Identifier for this medium.
  * @property {String} [mediumName]
  *           Name of this medium
  * @property {String} [MediumDescription]
  *           Description for this medium.
  * @property {DatetimeUTC} [mediumAddedAt]
  *           UTC Datetime when this medium got created.
  * @property {DatetimeUTC} [mediumModifiedAt]
  *           UTC Datetime when this medium got modified the last time.
  */

/**
 * Creates a new Medium record and returns the created Medium object.
 * @memberof plantJournal.Medium
 * @async
 * @param {Object} options
 *         Options how the new Medium should be.
 * @param {String} options.mediumName
 *        Name of this plant.
 * @param {String} [options.mediumDescription='']
 *        Description for this Medium
 * @throws {Error}
 *         Will throw error if an unexpected sqlite error happens.
 * @return {Object} mediumCreate
 * @return {Object.<MediumId, MediumObject>} mediumCreate.medium
 *         Object holding information about created medium. This will only
 *         happen if no options.genotypId was set. There should only be one key,
 *         which is the id of the newly created plant.
 */
Medium.add = async function(options) {
  return await MediumAdd.add(options);
};

/**
 * Searches for Mediums based on criteria and returns them.
 * @memberof plantJournal.Medium
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: mediumId, mediumName,
 *         mediumDescription, mediumAddedAt, mediumModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFindMedium}
 *         Found Mediums
 */
Medium.find = async function(criteria) {
  return await MediumFind.find(criteria);
};

/**
 * Deletes mediums and related plants based on search criteria. Returns which
 * model record ids got deleted.
 * @memberof plantJournal.Medium
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: mediumId, mediumName,
 *         mediumDescription, mediumAddedAt, mediumModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnMediumDelete
 *         Object containing info about all deleted records from the different
 *         models.
 *         Not all child arrays have to be set.
 * @return {MediumId[]} returnMediumDelete.mediums
 * @return {PlantId[]} returnMediumDelete.plants
 *         Array containing all deleted plant ids.
 */
Medium.delete = async function(criteria) {
  return await MediumDelete.delete(criteria);
};

/**
 * Finds mediums and updates attributes based on the passed update Object.
 * Sets environmentUpdatedAt to current UTC Datetime of all changed families.
 * @memberof plantJournal.Family
 * @async
 * @param  {MediumObject} update
 *         Subset of MediumObject containing attributes which should get
 *         updated. You can't update environmentId, environmentAddedAt
 *         and environmentUpdatedAt.
 * @param  {Criteria} criteria
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: mediumId, mediumName,
 *         mediumDescription, mediumAddedAt, mediumModifiedAt.
 * @throws {Error}
 *         Should only throw error if something suspicous and unexpected
 *         happend to our sqlite connection.
 * @return {MediumId[]}
 *         Returns an array of updated {@link MediumId|MediumIds}.
 *         Empty if none got updated.
 */
Medium.update = async function(update, criteria) {
  return await MediumUpdate.update(update, criteria);
};
