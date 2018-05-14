'use strict';

const FamilyCreate = require('./family/family-create');
const FamilyFind = require('./family/family-find');
const FamilyDelete = require('./family/family-delete');
const FamilyUpdate = require('./family/family-update');

/**
 * @typedef {Object} ReturnFind
 *          Object containing all information about this find request.
 *          This Object contains information about how many families were
 *          found in total, how many are left and which families were found.
 *          It also holds information about the various families like
 *          the familyName, familyCreatedAt...
 * @property {number} ReturnFind.count
 *         How many families were found in total. If you don't search for
 *         specific families, this will be the amount of all families we know.
 *         Otherwise how many families were found matching that search. Not all
 *         of them have to be returned by now, but with offset/limit you could
 *         get all of them. Useful for paging.
 * @property {number} ReturnFind.remaining
 *         Indicates how many families are remaining for this search. This is
 *         useful for paging. Imagine you have 10 families, and with limit=2
 *         you get only the first to. There would be still 8 remaining.
 *         With offset=2 you would get the next 2 (family 2-4) and 6 would
 *         be remaining.
 * @property {Object<FamilyId, FamilyObject>} [ReturnFind.families]
 *         Found or related families. Key is always the familyId to make it
 *         easier to get a family with a specific key out of the Object. Value
 *         will be also an Object, but filled with information/family attributes
 *         about one single family. See jsdoc Family Object description.
 * @property {Object<GenerationId, GenerationObject>} [ReturnFind.generations]
 *         Found or related Generations. Similiar to families, key is
 *         generationId, value is GenerationObject.
 * @property {Object<GenotypeId, GenotypeObject>} [ReturnFind.genotypes]
 *         Found or related Generations. Similiar to families, key is
 *         generationId, value is GenerationObject.
 * @property {Object<PlantId, PlantObject>} [ReturnFind.plants]
 *         Found or related Generations. Similiar to families, key is
 *         generationId, value is GenerationObject.
 * @property {Object<MediumId, MediumObject>}
 * @property {Object<EnvironmentId, EnvironmentObject>}
 */


/**
 * @typedef {number} DatetimeUTC
 *          UTC Datetime. If you want to create a datetime, see
 *          {@link Utils.getDatetimeUTC}.
 */

/**
 * @typedef {Object} Criteria
 * @property  {String[]} [criteria.attributes]
 *         Define which attributes you want to return. By default all available.
 * @property  {Object} [criteria.where]
 *         See Utils.applyFilter how to use this. Small example:
 *         where: {familyId: [1,2,3]} => where familyId is either 1,2 or 3
 *         where: {familyName: 'TestFamily2'} => where familyName is TestFamily2
 *         Queryable Fields: familyId, familyName
 * @property  {integer} [criteria.limit=10]
 *         Limit how many record should we search for (and return).
 * @property  {integer} [criteria.offset=0]
 *         Skip the first x records. Needed for paging.
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
 *          Object containing all information specific to this family.
 * @property {FamilyId} familyId
 *           Unique Identifier for this family.
 * @property {String} familyName
 *           Name of this family.
 * @property {DatetimeUTC} familyCreatedAt
 *           UTC Datetime when this family got created.
 * @property {DatetimeUTC} familyModifiedAt
 *           UTC Datetime when this family got modified the last time.
 */

/**
 * Creates a new Family entry and returns the created family Object.
 * Internally calls src/controller/family-create.
 * @memberof plantJournal.Family
 *
 *
 * @async
 * @param  {Object} options
 *         Options how the new family should be.
 * @param  {String} options.familyName
 *         Name for the new family
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} familyCreate
 * @return {Object<FamilyId, FamilyObject>} familyCreate.families
 *         Object holding information about created family. There should
 *         only be one key, which is the id of the newly created family.
 */
Family.create = async function(options) {
  return await FamilyCreate.create(options);
};

/**
 * Find families based on criteria and returns them. You can select the families
 * to return based on various so called criterias.
 * Internally calls src/controller/family-find.
 * @memberof plantJournal.Family
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: familyId, familyName,
 *         familyCreatedAt, familyModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFindFamily} - Found families
 */
Family.find = async function(criteria) {
  return await FamilyFind.find(criteria);
};

/**
 * Deletes families and related generations, genotypes and plants based on
 * criteria. Returns which model record ids got deleted.
 * @memberof plantJournal.Family
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to delete. Queryable Attributes: familyId, familyName,
 *         familyCreatedAt, familyModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {Object} returnFamilyDelete
 *         Object containing info about all deleted records from the different
 *         models.
 *         Not all child arrays have to be set.
 * @return {FamilId[]} returnFamilyDelete.families
 *         Array containing all deleted family ids.
 * @return {GenerationId[]} returnFamilyDelete.generations
 *         Array containing all deleted generation ids.
 * @return {GenotypeId[]} returnFamilyDelete.genotypes
 *         Array containing all deleted genotye ids.
 * @return {PlantId[]} returnFamilyDelete.plants
 *         Array containing all deleted plant ids.
 */
Family.delete = async function(criteria) {
  return await FamilyDelete.delete(criteria);
};

/**
 * Finds families and updates attributes based on the passed update Object.
 * Sets familyUpdatedAt to current UTC Datetime of all changed families.
 * @memberof plantJournal.Family
 * @async
 * @param  {Object} update
 *         With update Object you can define which properties should get
 *         updated.
 * @param  {String} [update.familyName]
 *         Update familyName to this value.
 * @param  {Criteria} criteria
 *         With criteria you can control which families should get updated.
 *         For a `dry-run` just use Family.find().
 * @throws {Error}
 *         Should only throw error if something suspicous and unexpected
 *         happend to our sqlite connection.
 * @return {FamilyId[]}
 *         Returns a array of updated {@link FamilyId|FamilyIds}.
 *         Empty if none got updated.
 */
Family.update = async function(update, criteria) {
  return await FamilyUpdate.update(update, criteria);
};

module.exports = Family;
