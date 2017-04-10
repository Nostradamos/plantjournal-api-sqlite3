'use strict';

const squel = require('squel');
const sqlite = require('sqlite');
const logger = require('./logger');



class plantJournal {
  constructor(options) {
    this.options = options;
  }

  async connect() {
    await sqlite.open(this.options);
    if(this.options === ':memory:') {
      logger.info('Creating default tables');
      await require('./create-tables')();
    }

    // Enable foreign keys
    try {
      await sqlite.all('PRAGMA foreign_keys = ON;');
    } catch (err) {
      // ToDo: Get the exact error message for this.
      throw new Error('SQLite Database does not support foreign keys. Recompile with foreign_keys support!');
    }
  }

  async disconnect() {
    await sqlite.close();
  }
}

plantJournal.prototype.Family = require('./family');
plantJournal.prototype.Generation = require('./generation');

module.exports = plantJournal;
