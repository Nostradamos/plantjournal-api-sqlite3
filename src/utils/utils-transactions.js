'use strict';

const sqlite = require('sqlite');

const Mutex = require('./mutex');

/**
 * UtilsTransactions.
 * @namespace
 */
let UtilsTransactions = exports;

UtilsTransactions.mutex = new Mutex();

UtilsTransactions.beginTransaction = async function() {
  await UtilsTransactions.mutex.lock();
  await sqlite.get('BEGIN');
};

UtilsTransactions.rollbackTransaction = async function() {
  await sqlite.get('ROLLBACK');
  UtilsTransactions.mutex.unlock();
};

UtilsTransactions.endTransaction = async function() {
  await sqlite.get('COMMIT');
  UtilsTransactions.mutex.unlock();
};
