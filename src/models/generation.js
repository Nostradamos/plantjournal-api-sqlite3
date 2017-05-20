'use strict';

const GenerationCreate = require('../controller/generation-create');
const GenerationFind = require('../controller/generation-find');

let Generation = exports;

Generation.create = async function create(options) {
  return await GenerationCreate.create(options);
}

Generation.find = async function find(criteria) {
  return await GenerationFind.find(criteria);
}
