'use strict';

const FamilyCreate = require('../controller/family-create');
const FamilyFind = require('../controller/family-find');
const FamilyDelete = require('../controller/family-delete');
const FamilyUpdate = require('../controller/family-update');

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

Family.delete = async function(criteria) {
  return await FamilyDelete.delete(criteria);
}

Family.update = async function(update, criteria) {
  return await FamilyUpdate.update(update, criteria);
}
