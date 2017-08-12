'use strict';

const CONSTANTS = require('../../constants');

const GenericLogFind = require('../generic-log/generic-log-find');

class PlantLogFind extends GenericLogFind {
}


PlantLogFind.TABLE = CONSTANTS.TABLE_PLANT_LOGS;

PlantLogFind.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG;

PlantLogFind.ATTR_TIMESTAMP = CONSTANTS.ATTR_TIMESTAMP_PLANT_LOG;

PlantLogFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.ALL_ATTRIBUTES_PLANT_LOG;

PlantLogFind.DEFAULT_FIELDS = [
    CONSTANTS.TABLE_PLANT_LOGS + '.' + CONSTANTS.ATTR_ID_PLANT_LOG,
    CONSTANTS.TABLE_PLANT_LOGS + '.' +  CONSTANTS.ATTR_TIMESTAMP_PLANT_LOG
];

// We don't join plants for plantId, so overwrite table lookup
PlantLogFind.OVERWRITE_TABLE_LOOKUP = {
    [CONSTANTS.ATTR_ID_PLANT]: CONSTANTS.TABLE_PLANT_LOGS
};

PlantLogFind.PLURAL = CONSTANTS.PLURAL_PLANT_LOG;

module.exports = PlantLogFind;
