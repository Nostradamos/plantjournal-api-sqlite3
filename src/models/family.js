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
