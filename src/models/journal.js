'use strict';

const JournalCreate = require('../controller/journal/journal-create');
const JournalFind = require('../controller/journal/journal-find');
const JournalDelete = require('../controller/journal/journal-delete');
const JournalUpdate = require('../controller/journal/journal-update');

/**
 * Namespace containing all CRUD methods for Journal.
 * @namespace plantJournal.Journal
 * @memberof plantJournal
 */
let Journal = exports;

/**
 * @typedef {number} JournalId
 *          Unique Identifier for a journal record.
 */

/**
 * @typedef {Object} JournalObject
 * @property {JournalId} journalId
 *           The unique identifier of this journal record.
 * @property {plantId} plantId
 *           The id of the plant this log is for.
 * @property {UnixTimestampUTC} journalTimestamp
 *           Unix UTC Timestamp specifying the time this log is connected to.
 *           Multiple logs can have the same timestamp, they will be grouped
 *           together.
 * @property {String} journalType
 *           Type of this log. Could be "log", "note", "todo".
 * @property {String} journalValue
 *           Value for this journal. For a journal of the type "todo", this
 *           would be the for example the task in text.
 * @property {UnixTimestampUTC} journalCreatedAt
 *           UTC Timestamp when this journal got created.
 * @property {UnixTimestampUTC} journalModifiedAt
 *           UTC Timestamp when this journal got modified the last time.
 */



/**
 * Creates a new journal entry and returns the created genotype object.
 * @memberof plantJournal.journal
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {Number} options.plantId
 *         Has to be the id of the plant this log should be for.
 * @param  {UnixTimestampUTC} options.journalTimestamp
 *         Timestamp for this log
 * @param  {String} options.journalType
 *         Type of the journal.
 * @param  {integer} options.journalValue
 *         Value of the journal
 * @throws {Error}
 *         Will throw error if plantId is invalid or if an unexpected
 *         sqlite error happens.
 * @return {Object} JournalCreate
 *         Object containing all information given
 */
Journal.create = async function(options) {
  return await JournalCreate.create(options);
};

/**
 * Find journals based on criteria and returns them. You can select the
 * journals to return based on various so called criterias.
 * @memberof plantJournal.journal
 * @async
 * @param {criteria} criteria
 *        Control which journals you want to search for.
 *        Queryable Fields: plantId, journalId, journalType, journalValue,
 *        journalCreatedAt, journalModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFind}
 *         Object containing information about found journals.
 */
Journal.find = async function(criteria) {
  return await JournalFind.find(criteria);
};

/**
 * Deletes journals based on criteria.
 * Returns which journal ids got deleted.
 * @memberof plantJournal.journal
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which genotypes you want
 *         to delete.
 *         Queryable Fields: plantId, journalId, journalType, journalValue,
 *         journalCreatedAt, journalModifiedAt
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnGenotypeDelete
 *         Object containing info about all deleted journals.
 * @return {JournalId[]} returnGenotypeDelete.journal
 *         Array containing all deleted genotye ids.
 */
Journal.delete = async function(criteria) {
  return await JournalDelete.delete(criteria);
};

/**
 * Update journal based on update and criteria.
 * This method allows you to update one or more journals.
 * With the criteria object you can search through all journals
 * and pick the ones you want to update. It behaves similiar (but not
 * equal) to journal.find().
 * With update you can overwrite all attributes except journalId,
 * journalCreatedAt, journalModifiedAt.
 * journalModifiedAt will be set to the current UTC timestamp for all updated
 * genotypes. If you want to know how journal update works internally,
 * see src/controller/journal/journal-update and
 * src/controller/generic/generic-update.
 * @memberof plantJournal.journal
 * @async
 * @param  {Object} update
 *         Fields to update.
 * @param  {UnixTimestampUTC} [update.journalTimestamp]
 *         Update journalTimestamp.
 * @param  {String} [update.journalType]
 *         Update journalType.
 * @param  {String} [update.journalValue]
 *         Update journalValue.
 * @param  {GenerationId} [update.plantId]
 *         Update plantId.
 * @param  {Criteria} criteria
 *         With Criteria you can control which journals should get updated.
 * @returns {GenotypeId[]}
 *          Array of updated journalIds. Empty if no journals got updated.
 */
Journal.update = async function(update, criteria) {
  return await JournalUpdate.update(update, criteria);
};
