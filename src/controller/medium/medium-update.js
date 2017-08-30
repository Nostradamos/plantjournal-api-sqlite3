'use strict';

const CONSTANTS = require('../../constants');
const GenericUpdate = require('../generic/generic-update');

class MediumUpdate extends GenericUpdate {
}


MediumUpdate.TABLE = CONSTANTS.TABLE_MEDIUM;

MediumUpdate.ATTR_ID = CONSTANTS.ATTR_ID_MEDIUM;

MediumUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_MEDIUM;

MediumUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_MEDIUM;

MediumUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_MEDIUM;

module.exports = MediumUpdate;
