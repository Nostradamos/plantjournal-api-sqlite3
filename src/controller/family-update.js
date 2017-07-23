'use strict';

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * FamilyUpdate Skeleton. See GenericUpdate for more information.
 * Defaul Behaviour with modified TABLE, ID FIELDS... is enough for
 * our use.
 * @private
 * @extends GenericUpdate
 */
class FamilyUpdate extends GenericUpdate {
}

FamilyUpdate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyUpdate.ATTR_ID = CONSTANTS.ATTR_ID_FAMILY;

FamilyUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_FAMILY;

// We can search through all attributes related to family
FamilyUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_FAMILY;

FamilyUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_FAMILY;

module.exports = FamilyUpdate;
