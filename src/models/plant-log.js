'use strict';

const PlantLogCreate = require('../controller/plant-log/plant-log-create');
const PlantLogFind = require('../controller/plant-log/plant-log-find');
const PlantLogDelete = require('../controller/plant-log/plant-log-delete');
const PlantLogUpdate = require('../controller/plant-log/plant-log-update');

let PlantLog = exports;

PlantLog.create = async function(options) {
    return await PlantLogCreate.create(options);
};

PlantLog.find = async function(criteria) {
    return await PlantLogFind.find(criteria);
};

PlantLog.delete = async function(criteria) {
    return await PlantLogDelete.delete(criteria);
};

PlantLog.update = async function(update, criteria) {
    return await PlantLogUpdate.update(update, criteria);
};
