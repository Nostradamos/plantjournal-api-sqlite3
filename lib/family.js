'use strict';

const FamilyCreate = require('./family-create');
const FamilyFind = require('./family-find');

let Family = exports;

/**
 * Creates a new Family entry and returns the family object.
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
Family.create = async function(options) {
  return await FamilyCreate.create(options);
}

Family.find = async function(criteria) {
  return await FamilyFind.find(criteria);
}
