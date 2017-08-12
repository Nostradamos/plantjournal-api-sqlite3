'use strict';

const CONSTANTS = require('../../constants');

const GenericLogDelete = require('../generic-log/generic-log-delete');

class PlantLogDelete extends GenericLogDelete {
}

PlantLogDelete.TABLE = CONSTANTS.TABLE_PLANT_LOGS;

PlantLogDelete.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG;

PlantLogDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.ALL_ATTRIBUTES_PLANT_LOG;

PlantLogDelete.PLURAL = CONSTANTS.PLURAL_PLANT_LOG;

PlantLogDelete.OVERWRITE_TABLE_LOOKUP = {
    [CONSTANTS.ATTR_ID_PLANT]: CONSTANTS.TABLE_PLANT_LOGS
};

module.exports = PlantLogDelete;
