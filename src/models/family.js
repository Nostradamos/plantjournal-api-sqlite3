'use strict';

const FamilyCreate = require('../controller/family-create');
const FamilyFind = require('../controller/family-find');
const FamilyDelete = require('../controller/family-delete');
const FamilyUpdate = require('../controller/family-update');

let Family = exports;

/**
 * @typedef {Object} Family
 * @property {integer} familyId
 *           Unique Identifier for this family.
 * @property {String} familyName
 *           Name of this family.
 * @property {integer} familyCreatedAt
 *           UTC Timestamp when this family got created.
 * @property {integer} familyModifiedAt
 *           UTC Timestamp when this family got modified the last time.
 */

/**
 * @typedef {Object} FamilyFind
 * @type {integer} count
 *       Counter for how many families where found for this request in total.
 * @type {integer} remaining
 *       Counter for how many families are available after this request.
 *       By increasing criteria.offset or criteria.limit you could get them.
 * @type {Object} families
 *       Key is always familyId, value is Family object.
 */

/**
 * Creates a new Family entry and returns the created family object.
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {String} options.familyName
 *         Name for the new family
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Family}
 *         The newly created Family object
 */
Family.create = async function(options) {
  return await FamilyCreate.create(options);
}

/**
 * Find families based on criteria and returns them. You can select the families
 * to return based on various so called criterias.
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
 * @return {FamilyFind}
 *
 */
Family.find = async function(criteria) {
  return await FamilyFind.find(criteria);
}

Family.delete = async function(criteria) {
  return await FamilyDelete.delete(criteria);
}

/**
 * Finds families and updates fields based on the passed update object.
 * Sets familyUpdatedAt to current UTC Timestamp of all changed families.
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
 * @return {integer[]}
 *         Returns a array of updated familyIds. Empty if none got updated.
 */
Family.update = async function(update, criteria) {
  return await FamilyUpdate.update(update, criteria);
}
