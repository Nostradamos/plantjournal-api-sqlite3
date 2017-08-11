'use strict';

const PlantLogCreate = require('../controller/plant-log/plant-log-create');
const PlantLogFind = require('../controller/plant-log/plant-log-find');

let PlantLog = exports;

PlantLog.create = async function(options) {
    return await PlantLogCreate.create(options);
}

PlantLog.find = async function(criteria) {
    return await PlantLogFind.find(options);

}
