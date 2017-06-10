'use strict';

const GenotypeCreate = require('../controller/genotype-create');
const GenotypeFind = require('../controller/genotype-find');
const GenotypeDelete = require('../controller/genotype-delete');

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
