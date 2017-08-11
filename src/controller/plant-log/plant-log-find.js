'use strict';


const CONSTANTS = require('../../constants');

const GenericFind = require('../generic/generic-find');

class PlantLogFind extends GenericFind {
    static buildReturnObjectWhere(returnObject, context, criteria) {
    // build families object
        returnObject.plantLogs =  {};
        _.each(context.rowsWhere, function(row) {
            Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria, true);
        });
    }
}


PlantLogFind.TABLE = CONSTANTS.TABLE_PLANT_LOGS;

PlantLogFind.ATTR_ID = CONSTANTS.ATTR_ID_PLANT_LOG;

PlantLogFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.ATTRIBUTES_PLANT_LOG;

module.exports = PlantLogFind;
