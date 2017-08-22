'use strict';

const PlantLogCreate = require('../controller/plant-log/plant-log-create');
const PlantLogFind = require('../controller/plant-log/plant-log-find');
const PlantLogDelete = require('../controller/plant-log/plant-log-delete');
const PlantLogUpdate = require('../controller/plant-log/plant-log-update');

/**
 * Namespace containing all CRUD methods for PlantLog.
 * @namespace plantJournal.PlantLog
 * @memberof plantJournal
 */
let PlantLog = exports;

/**
 * @typedef {number} PlantLogId
 *          Unique Identifier for a plantLog record.
 */

/**
 * @typedef {Object} PlantLogObject
 * @property {PlantLogId} plantLogId
 *           The unique identifier of this plantLog record.
 * @property {plantId} plantId
 *           The id of the plant this log is for.
 * @property {UnixTimestampUTC} plantLogTimestamp
 *           Unix UTC Timestamp specifying the time this log is connected to.
 *           Multiple logs can have the same timestamp, they will be grouped
 *           together.
 * @property {String} plantLogType
 *           Type of this log. Could be "log", "note", "todo".
 * @property {String} plantLogValue
 *           Value for this plantLog. For a plantLog of the type "todo", this
 *           would be the for example the task in text.
 * @property {UnixTimestampUTC} plantLogCreatedAt
 *           UTC Timestamp when this plantLog got created.
 * @property {UnixTimestampUTC} plantLogModifiedAt
 *           UTC Timestamp when this plantLog got modified the last time.
 */



/**
 * Creates a new plantLog entry and returns the created genotype object.
 * @memberof plantJournal.plantLog
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {Number} options.plantId
 *         Has to be the id of the plant this log should be for.
 * @param  {UnixTimestampUTC} options.plantLogTimestamp
 *         Timestamp for this log
 * @param  {String} options.plantLogType
 *         Type of the plantLog.
 * @param  {integer} options.plantLogValue
 *         Value of the plantLog
 * @throws {Error}
 *         Will throw error if plantId is invalid or if an unexpected
 *         sqlite error happens.
 * @return {Object} PlantLogCreate
 *         Object containing all information given
 */
PlantLog.create = async function(options) {
    return await PlantLogCreate.create(options);
};

/**
 * Find plantLogs based on criteria and returns them. You can select the
 * plantLogs to return based on various so called criterias.
 * @memberof plantJournal.plantLog
 * @async
 * @param {criteria} criteria
 *        Control which plantLogs you want to search for.
 *        Queryable Fields: plantId, plantLogId, plantLogType, plantLogValue,
 *        plantLogCreatedAt, plantLogModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing information about found plantLogs.
 */
PlantLog.find = async function(criteria) {
    return await PlantLogFind.find(criteria);
};

/**
 * Deletes plantLogs based on criteria.
 * Returns which plantLog ids got deleted.
 * @memberof plantJournal.plantLog
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which genotypes you want
 *         to delete.
 *         Queryable Fields: plantId, plantLogId, plantLogType, plantLogValue,
 *         plantLogCreatedAt, plantLogModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnGenotypeDelete
 *         Object containing info about all deleted plantLogs.
 * @return {PlantLogId[]} returnGenotypeDelete.plantLog
 *         Array containing all deleted genotye ids.
 */
PlantLog.delete = async function(criteria) {
    return await PlantLogDelete.delete(criteria);
};

/**
 * Update plantLog based on update and criteria.
 * This method allows you to update one or more plantLogs.
 * With the criteria object you can search through all plantLogs
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to plantLog.find().
 * With update you can overwrite all attributes except plantLogId,
 * plantLogCreatedAt, plantLogModifiedAt.
 * plantLogModifiedAt will be set to the current UTC timestamp for all updated
 * genotypes. If you want to know how plantLog update works internally,
 * see src/controller/plant-log/plant-log-update and
 * src/controller/generic/generic-update.
 * @memberof plantJournal.plantLog
 * @async
 * @param  {Object} update
 *         Fields to update.
 * @param  {UnixTimestampUTC} [update.plantLogTimestamp]
 *         Update plantLogTimestamp.
 * @param  {String} [update.plantLogType]
 *         Update plantLogType.
 * @param  {String} [update.plantLogValue]
 *         Update plantLogValue.
 * @param  {GenerationId} [update.plantId]
 *         Update plantId.
 * @param  {Criteria} criteria
 *         With Criteria you can control which plantLogs should get updated.
 * @returns {GenotypeId[]}
 *          Array of updated plantLogIds. Empty if no plantLogs got updated.
 */
PlantLog.update = async function(update, criteria) {
    return await PlantLogUpdate.update(update, criteria);
};
