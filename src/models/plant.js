'use strict';

const PlantCreate = require('../controller/plant-create');
const PlantFind = require('../controller/plant-find');

let Plant = exports;

Plant.create = async function create(options) {
  return await PlantCreate.create(options);
}

Plant.find = async function find(criteria) {
  return await PlantFind.find(criteria);
}
