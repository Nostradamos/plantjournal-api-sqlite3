'use strict';

const FamilyCreate = require('../controller/family-create');
const FamilyFind = require('../controller/family-find');
const FamilyDelete = require('../controller/family-delete');
const FamilyUpdate = require('../controller/family-update');

/**
 * @typedef {number} UnixTimestampUTC
 *          UTC Timestamp. If you want to create a timestamp, see
 *          {@link Utils.getUnixTimestampUTC}.
 */

/**
 * Family namspace holds all CRUD methods for Family.
 * @namespace plantJournal.Family
 * @memberof plantJournal
 */
var Family = {};

/**
 * @typedef {number} FamilyId
 *          Unique Identifier for this family.
 */

/**
 * @typedef {Object} FamilyObject
 * @property {FamilyId} familyId
 *           Unique Identifier for this family.
 * @property {String} familyName
 *           Name of this family.
 * @property {UnixTimestampUTC} familyCreatedAt
 *           UTC Timestamp when this family got created.
 * @property {UnixTimestampUTC} familyModifiedAt
 *           UTC Timestamp when this family got modified the last time.
 */

/**
 * Creates a new Family entry and returns the created family object.
 * Internally calls {@link FamilyCreate|FamilyCreate.create()}.
 * @see {@link FamilyCreate}
 * @memberof plantJournal.Family
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {String} options.familyName
 *         Name for the new family
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {FamilyObject}
 *         The newly created Family object
 */
Family.create = async function(options) {
  return await FamilyCreate.create(options);
}

/**
 * Find families based on criteria and returns them. You can select the families
 * to return based on various so called criterias.
 * Internally calls {@link Family|FamilyFind.find}.
 * @memberof plantJournal.Family
 * @async
 * @param  {Object} [criteria]
 *         Criteria object. With this you can control which families you want
 *         to return.
 * @param  {String[]} [criteria.fields]
 *         Define which fields you want to return. By default all available.
 * @param  {Object} [criteria.where]
 *         See Utils.setWhere how to use this. Small example:
 *         where: {familyId: [1,2,3]} => where familyId is either 1,2 or 3
 *         where: {familyName: 'TestFamily2'} => where familyName is TestFamily2
 *         Queryable Fields: familyId, familyName
 * @param  {integer} [criteria.limit=10]
 *         Limit how many families should get find (and returned).
 * @param  {integer} [criteria.offset=0]
 *         Skip the first x families. Needed for paging.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 *
 * @return {Object} foundFamilies
 *         Object containing all information about found families.
 * @return {integer} foundFamilies.count
 *         How many families where found in total. If you don't search for
 *         specific families, this will be the amount of all families we know.
 *         Otherwise how many families where found matching that search. Not all
 *         of them have to be returned by now, but with offset/limit you could
 *         get all of them. Useful for paging.
 * @return {integer} foundFamilies.remaining
 *         Indicates how many families are remaining for this search. This is
 *         useful for paging. Imagine you have 10 families, and with limit=2
 *         you get only the first to. There would be still 8 remaining.
 *         With offset=2 you would get the next 2 (family 2-4) and 6 would
 *         be remaining.
 * @return {Object.<FamilyId, FamilyObject>} foundFamilies.families
 *         The actual families. Key is always the familyId to make it easier
 *         to get a family with a specific key out of the object. Value will
 *         be also an object, but filled with information/family attributes
 *         about one single family. See jsdoc Family object description.
 *
 */
Family.find = async function(criteria) {
  return await FamilyFind.find(criteria);
}

/**
 * Deletes families based on criteria.
 * @memberof plantJournal.Family
 * @async
 * @param  {Object} [criteria]
 *         Criteria object. With this you can control which families you want
 *         to delete.
 * @param  {Object} [criteria.where]
 *         See Utils.setWhere how to use this. Small example:
 *         where: {familyId: [1,2,3]} => where familyId is either 1,2 or 3
 *         where: {familyName: 'TestFamily2'} => where familyName is TestFamily2
 *         Queryable Fields: familyId, familyName
 * @param  {integer} [criteria.limit=10]
 *         Limit how many families should get deleted.
 * @param  {integer} [criteria.offset=0]
 *         Skip the first x families.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {FamilyId[]}
 *         Returns an array of deleted {@link FamilyId|FamilyIds}.
 */
Family.delete = async function(criteria) {
  return await FamilyDelete.delete(criteria);
}

/**
 * Finds families and updates fields based on the passed update object.
 * Sets familyUpdatedAt to current UTC Timestamp of all changed families.
 * @memberof plantJournal.Family
 * @async
 * @param  {Object} update
 *         With update object you can define which properties should get
 *         updated.
 * @param  {String} [update.familyName]
 *         Update familyName to this value.
 * @param  {Object} criteria
 *         With criteria you can specify which families should get updated.
 *         We basically find families similiar to Family.find().
 * @param  {Object} [criteria.where]
 *         See Utils.setWhere(). Fields to search throug:
 *         familyId, familyName, familyCreatedAt, familyModifiedAt
 * @param  {integer}   [criteria.limit=10]
 *         Limit how many familiess should get updated.
 * @param  {integer}   [criteria.offset=10]
 *         Skip the first x families.
 * @throws {Error}
 *         Should only throw error if something suspicous and unexpected
 *         happend to our sqlite connection.
 * @return {FamilyId[]}
 *         Returns a array of updated {@link FamilyId|FamilyIds}. Empty if none got updated.
 */
Family.update = async function(update, criteria) {
  return await FamilyUpdate.update(update, criteria);
}

module.exports = Family;
