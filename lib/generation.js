'use strict';

const GenerationCreate = require('./generation-create');
const GenerationFind = require('./generation-find');

let Generation = exports;

Generation.create = async function create(options) {
  return await GenerationCreate.create(options);
}

Generation.find = async function find(criteria) {
  return await GenerationFind.find(criteria);
}
