'use strict';

const Knex = require('knex');
const newLogger = require('./logger');

const Environment = require('./models/environment/environment');
const Medium = require('./models/medium/medium');
const Family = require('./models/family/family');
const Generation = require('./models/generation/generation');
const Genotype = require('./models/genotype/genotype');
const Plant = require('./models/plant/plant');
const Attachment = require('./models/attachment/attachment.js');
const Journal = require('./models/journal/journal.js');

/**
 * The main plantJournal class.
 * You have to init this class to open up a connection to sqlite and be able
 * to access the models.
 * @class
 */
class plantJournal {
  /**
   * Init a new plantJournal instance.
   * @param  {object} options
   *         All options. Currently this will get directly passed to sqlite,
   *         so all valid sqlite options you can also use here.
   */
  constructor(options) {
    this.options = options;
    this.knex = null;
    this.logger = newLogger();
  }

  /**
   * Connects to sqlite
   * @async
   * @throws {Error}
   *         Throws error if sqlite lib doesn't support JSON or foreign_keys,
   *         or if anything else happens and we fail to connect to the sqlite
   *         database.
   */
  async connect() {
    let self = this;
    this.knex = Knex(this.options)
      .on('query', function(data) {
        //self.logger.debug(self.knex.Client._formatQuery(data.sql, data.bindings));
        let queryStr = self.knex.client._formatQuery(data.sql, data.bindings);
        self.logger.debug('Query:', queryStr);
      });
    this.logger.info('Creating default tables');
    await require('./create-tables')(this.knex);

    // Enable foreign keys
    await this.sqlite3EnableForeignKeys();

    // Make sure we have json support
    // ToDo: Maybe this is obsolet and JSON is always enabled?!
    await this.sqlite3TestForJSONSupport();

		this.Environment= new Environment(this);
		this.Medium = new Medium(this);

    this.Family = new Family(this);
    this.Generation = new Generation(this);
    this.Genotype = new Genotype(this);
		this.Plant = new Plant(this);

    this.Journal = new Journal(this);
    this.Attachment = new Attachment(this);
  }

  /**
   * Enables foreign keys in sqlite3 database
   * NOTE: This method is sqlite3 specific
   * @async
   * @throws {Error}
   *         Throws error if we failed on enabling foreign keys.
   */
  async sqlite3EnableForeignKeys() {
    try {
      await this.knex.raw('PRAGMA foreign_keys = ON;');
    } catch (err) {
      throw new Error('SQLite Database does not support foreign keys. Recompile with foreign_keys support!');
    }
    this.logger.debug('Enabled foreign key support for sqlite3 database');
  }

  /**
   * This method makes sure that the sqlite3 database has JSON support.
   * NOTE: This method is sqlite3 specific
   * @async
   * @throws {Error}
   *         Throws error if we don't have JSON support.
   */
  async sqlite3TestForJSONSupport() {
    let row;
    try {
      row = await this.knex.raw(
        `SELECT json_extract('{"a":13, "b":42}', '$.b') as test;`);
    } catch (err) {
      throw err;
    } finally {
      if (row[0].test !== 42) {
        throw new Error(`Your sqlite3 install doesn't support JSON. We can't continue. ${JSON.stringify(row)}`);
      }
    }
    this.logger.debug('Successfully checked for JSON support on sqlite3 databse');
  }
  /**
   * Disconnect from sqlite3 database
   */
  async disconnect() {
    return this.knex.destroy().then(() => {
      this.logger.info('successfully disconnected from database');
    });
  }
}

plantJournal.VERSION = '0.0.1';

module.exports = plantJournal;
