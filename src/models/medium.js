'use strict';

const MediumCreate = require('../controller/medium/medium-create');
const MediumFind = require('../controller/medium/medium-find');
const MediumDelete = require('../controller/medium/medium-delete');
const MediumUpdate = require('../controller/medium/medium-update');

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
 * Creates a new Medium record and returns the created Medium object.
 * @memberof plantJournal.Medium
 * @async
 * @param {Object} options
 *         Options how the new Medium should be.
 * @param {String} options.MediumName
 *        Name of this plant.
 * @param {String} [options.MediumDescription='']
 *        Description for this Medium
 * @throws {Error}
 *         Will throw error if an unexpected sqlite error happens.
 * @return {Object} plantCreate
 * @return {Object.<MediumId, MediumObject>} plantCreate.plants
 *         Object holding information about created plant. This will only
 *         happen if no options.genotypId was set. There should
 *         only be one key, which is the id of the newly created plant.
 */
Medium.create = async function(options) {
    return await MediumCreate.create(options);
};

/**
 * Searches for Mediums based on criteria and returns them.
 * @memberof plantJournal.Medium
 * @async
 * @param  {Criteria} [criteria]
 *         Criteria Object. With this you can control which families you want
 *         to return. Queryable Attributes: MediumId, MediumName,
 *         MediumDescription, MediumCreatedAt, MediumModifiedAt.
 * @throws {Error}
 *         Should only throw error if an unexpected sqlite error happens.
 * @return {ReturnFindMedium}
 *         Found Mediums
 */
Medium.find = async function(criteria) {
    return await MediumFind.find(criteria);
};

Medium.delete = async function(criteria) {
    return await MediumDelete.delete(criteria);
};

Medium.update = async function(update, criteria) {
    return await MediumUpdate.update(update, criteria);
};
