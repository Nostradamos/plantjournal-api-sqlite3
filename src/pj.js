'use strict';

const sqlite = require('sqlite');
const logger = require('./logger');

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
        await sqlite.open(this.options);
        logger.info('Creating default tables');
        await require('./create-tables')();

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
            if (row.test !== 42) throw new Error('Your sqlite3 install doesn\'t support JSON. We can\'t continue. '+JSON.stringify(row));
        }
    }

    /**
     * Disconnect from sqlite3 database
     */
    async disconnect() {
        await sqlite.close();
    }
}

// Attach all models to plantJournal object

plantJournal.prototype.Family = require('./models/family');

plantJournal.prototype.Generation = require('./models/generation');

plantJournal.prototype.Genotype = require('./models/genotype');

plantJournal.prototype.Plant = require('./models/plant');

plantJournal.prototype.Environment = require('./models/environment');

plantJournal.prototype.Medium = require('./models/medium');

plantJournal.prototype.Journal = require('./models/journal');

plantJournal.prototype.version = '0.0.1';

module.exports = plantJournal;
