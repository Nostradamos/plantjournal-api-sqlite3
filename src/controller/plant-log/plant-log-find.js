'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');

const GenericFind = require('../generic/generic-find');

class PlantLogFind extends GenericFind {
    static buildReturnObjectWhere(returnObject, context, criteria) {
    // build families object
        returnObject.plantLogs = {};
        _.each(context.rowsWhere, function(row) {
            if(!_.has(returnObject.plantLogs, row.plantLogTimestamp)) {
                returnObject.plantLogs[row.plantLogTimestamp] = {};
            }
            returnObject.plantLogs[row.plantLogTimestamp][row.plantLogId] = {
                plantLogId: row.plantLogId,
                plantId: row.plantId,
                plantLogTimestamp: row.plantLogTimestamp,
                plantLogType: row.plantLogType,
                plantLogValue: row.plantLogValue,
                plantLogCreatedAt: row.plantLogCreatedAt,
                plantLogModifiedAt: row.plantLogModifiedAt
            }
        });
    }
}


PlantLogFind.TABLE = CONSTANTS.TABLE_PLANT_LOGS;

PlantLogFind.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG;

PlantLogFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.ATTRIBUTES_PLANT_LOG;

// We don't join plants for plantId, so overwrite table lookup
PlantLogFind.OVERWRITE_TABLE_LOOKUP = {
    'plantId': CONSTANTS.TABLE_PLANT_LOGS
}

module.exports = PlantLogFind;
