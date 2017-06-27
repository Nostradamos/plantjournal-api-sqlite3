'use strict';

const GenotypeCreate = require('../controller/genotype-create');
const GenotypeFind = require('../controller/genotype-find');
const GenotypeDelete = require('../controller/genotype-delete');
const GenotypeUpdate = require('../controller/genotype-update');

let Genotype = exports;


Genotype.create = async function(options) {
  return await GenotypeCreate.create(options);
}

Genotype.find = async function(criteria) {
  return await GenotypeFind.find(criteria);
}

Genotype.delete = async function(criteria) {
  return await GenotypeDelete.delete(criteria);
}

Genotype.update = async function(update, criteria) {
  return await GenotypeUpdate.update(update, criteria);
}
