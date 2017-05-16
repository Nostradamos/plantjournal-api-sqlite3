'use strict';

const GenotypeCreate = require('./genotype-create');
const GenotypeFind = require('./genotype-find');

let Genotype = exports;


Genotype.create = async function create(options) {
  return await GenotypeCreate.create(options);
}

Genotype.find = async function find(criteria) {
  return await GenotypeFind.find(criteria);
}
