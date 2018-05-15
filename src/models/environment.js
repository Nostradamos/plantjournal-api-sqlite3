'use strict';

const EnvironmentAdd = require('./environment/environment-add');
const EnvironmentFind = require('./environment/environment-find');
const EnvironmentDelete = require('./environment/environment-delete');
const EnvironmentUpdate = require('./environment/environment-update');

/**
 * Namespace containing all CRUD methods of Environment.
 * @namespace plantJournal.Environment
 * @memberof plantJournal
 */
let Environment = exports;

/**
 * @typedef {number} EnvironmentId
 *          Unique identifier for plants.
 */

/**
 * @typedef {Object} EnvironmentObject
 *          Object containing all information specific to this environment.
 * @property {environmentId} [environmentId]
 *           Unique Identifier for this environment.
 * @property {String} [environmentName]
 *           Name of this environment.
 * @property {String} [environmentDescription]
 *           Description for this environment.
 * @property {DatetimeUTC} [environmentAddedAt]
 *           UTC Datetime when this environment got created.
 * @property {DatetimeUTC} [environmentModifiedAt]
 *           UTC Datetime when this environment got modified the last time.
 */

/**
 * Creates a new environment record and returns the created environment object.
 * @memberof plantJournal.Environment
 * @async
 * @param {EnvironmentObject} options
 *        Subset of EnvironmentObject. On create we will ignore
 *        environmentId, environmentAddedAt and environmentModifiedAt.
 *        All other are needed, otherwise we will throw an error.
 * @throws {Error}
 *         Will throw error if an unexpected sqlite error happens.
 * @return {ReturnFind} plantCreate
 *         Object holding information about created environment. This will only
 *         happen if no options.genotypId was set. There should
 *         only be one key, which is the id of the newly created plant.
 * @return {ReturnFind} plantCreate.environments
 */
Environment.add = async function(options) {
  return await EnvironmentAdd.add(options);
};

/**
 * Searches for environments based on criteria and returns them.
 * @memberof plantJournal.Environment
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: environmentId, environmentName,
 *         environmentDescription, environmentAddedAt, environmentModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing found information about found environments
 * @return {ReturnFind.environments}
 *         Found environments
 */
Environment.find = async function(criteria) {
  return await EnvironmentFind.find(criteria);
};

/**
 * Deletes environments and related mediums/plants based on search
 * criteria. Returns which model record ids got deleted.
 * @memberof plantJournal.Environment
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to delete. Queryable Attributes: familyId, familyName,
 *         familyAddedAt, familyModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnEnvironmentDelete
 *         Object containing info about all deleted records from the different
 *         models.
 *         Not all child arrays have to be set.
 * @return {EnvironmentId[]} returnEnvironmentDelete.environments
 *         Array containing all deleted environment ids.
 * @return {MediumId[]} returnEnvironmentDelete.mediums
 * @return {PlantId[]} returnEnvironmentDelete.plants
 *         Array containing all deleted plant ids.
 */
Environment.delete = async function(criteria) {
  return await EnvironmentDelete.delete(criteria);
};

/**
 * Finds environments and updates attributes based on the passed update Object.
 * Sets environmentUpdatedAt to current UTC Datetime of all changed families.
 * @memberof plantJournal.Family
 * @async
 * @param  {EnvironmentObject} update
 *         Subset of EnvironmentObject containing attributes which should get
 *         updated. You can't update environmentId, environmentAddedAt
 *         and environmentUpdatedAt.
 * @param  {Criteria} criteria
 *         With criteria you can control which environments should get deleted.
 *         Same as Environment.find().
 * @throws {Error}
 *         Should only throw error if something suspicous and unexpected
 *         happend to our sqlite connection.
 * @return {EnvironmentId[]}
 *         Returns an array of updated {@link EnvironmentId|EnvironmentIds}.
 *         Empty if none got updated.
 */
Environment.update = async function(update, criteria) {
  return await EnvironmentUpdate.update(update, criteria);
};
