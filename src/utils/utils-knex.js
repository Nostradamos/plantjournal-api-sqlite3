'use strict';

/**
 * UtilsKnex.
 * @namespace
 */
let UtilsKnex = exports;

UtilsKnex.newTransaction = (knex) => {
  return new Promise((resolve, reject) => {
    knex.transaction((t) => {
      resolve(t);
    }).catch((err) => {
    });
  });
}
