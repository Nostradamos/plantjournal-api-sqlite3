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
    //if(this.options === ':memory:') {
      logger.info('Creating default tables');
      await require('./create-tables')();
    //}

    // Enable foreign keys
    try {
      await sqlite.all('PRAGMA foreign_keys = ON;');
    } catch (err) {
      // ToDo: Get the exact error message for this.
      throw new Error('SQLite Database does not support foreign keys. Recompile with foreign_keys support!');
    }

    // Make sure we have json support
    // ToDo: Maybe this is obsolet and JSON is always enabled?!
    let row;
    try {
      row = await sqlite.get(`SELECT json_extract('{"a":13, "b":42}', '$.b') as test;`);
    } catch (err) {
      throw err;
    } finally {
      if(row.test != 42) throw new Error('Your sqlite3 install doesn\'t support JSON. We can\'t continue. '+JSON.stringify(row));
    }
  }

  async disconnect() {
    await sqlite.close();
  }
}

plantJournal.prototype.Family = require('./family');
plantJournal.prototype.Generation = require('./generation');
plantJournal.prototype.Phenotype = require('./phenotype');
plantJournal.prototype.Plant = require('./plant');

module.exports = plantJournal;
