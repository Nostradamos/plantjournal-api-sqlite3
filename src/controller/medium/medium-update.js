'use strict';

const CONSTANTS = require('../../constants');
const GenericUpdate = require('../generic/generic-update');

class EnvironmentUpdate extends GenericUpdate {
}


EnvironmentUpdate.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentUpdate.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ENVIRONMENT;

EnvironmentUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_ENVIRONMENT;

EnvironmentUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_ENVIRONMENT;

module.exports = EnvironmentUpdate;
