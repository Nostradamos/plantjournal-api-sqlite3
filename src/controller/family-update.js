'use strict';

const _ = require('lodash');

const Utils = require('../utils');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * FamilyUpdate Skeleton. See GenericUpdate for more information.
 * Defaul Behaviour with modified TABLE, ID FIELDS... is enough for
 * our use.
 */
class FamilyUpdate extends GenericUpdate {
}

FamilyUpdate.TABLE = CONSTANTS.TABLE_FAMILIES;

FamilyUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_FAMILY;

FamilyUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_FAMILY;

// We can search through all fields related to family
FamilyUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_FAMILY;

// We don't want the id field to be updatable, so remove it
FamilyUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_FAMILY,
  CONSTANTS.ID_ALIAS_FAMILY,
  CONSTANTS.MODIFIED_AT_ALIAS_FAMILY,
  CONSTANTS.CREATED_AT_ALIAS_FAMILY
);

module.exports = FamilyUpdate;
