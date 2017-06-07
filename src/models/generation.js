'use strict';

const GenerationCreate = require('../controller/generation-create');
const GenerationFind = require('../controller/generation-find');
const GenerationDelete = require('../controller/generation-delete');

let Generation = exports;

Generation.create = async function(options) {
  return await GenerationCreate.create(options);
}

Generation.find = async function(criteria) {
  return await GenerationFind.find(criteria);
}

Generation.delete = async function(criteria) {
  return await GenerationDelete.delete(criteria);
}
