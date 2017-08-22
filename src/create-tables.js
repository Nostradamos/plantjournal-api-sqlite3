'use strict';

const sqlite = require('sqlite');
const CONSTANTS = require('./constants');

/**
 * This method creates all database tables.
 */
module.exports =  async function createTables() {
    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_FAMILIES + ` (
        familyId INTEGER,
        familyName TEXT NOT NULL,
        familyDescription TEXT NOT NULL DEFAULT '',
        familyCreatedAt DATETIME NOT NULL,
        familyModifiedAt DATETIME NOT NULL,
        PRIMARY KEY (familyId)
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_GENERATIONS + ` (
        generationId INTEGER,
        generationName TEXT NOT NULL,
        generationDescription TEXT NOT NULL DEFAULT '',
        generationCreatedAt DATETIME NOT NULL,
        generationModifiedAt DATETIME NOT NULL,
        familyId INTEGER NOT NULL,
        PRIMARY KEY (generationId),
        FOREIGN KEY(familyId) REFERENCES families(familyId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_GENOTYPES + ` (
        genotypeId INTEGER,
        genotypeName TEXT NOT NULL DEFAULT '',
        genotypeDescription TEXT NOT NULL DEFAULT '',
        genotypeCreatedAt DATETIME NOT NULL,
        genotypeModifiedAt DATETIME NOT NULL,
        generationId INTEGER NOT NULL,
        PRIMARY KEY (genotypeId),
        FOREIGN KEY(generationId) REFERENCES generations(generationId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_ENVIRONMENTS + ` (
        environmentId INTEGER,
        environmentName TEXT NOT NULL,
        environmentDescription TEXT NOT NULL DEFAULT '',
        environmentCreatedAt DATETIME NOT NULL,
        environmentModifiedAt DATETIME NOT NULL,
        PRIMARY KEY (environmentId)
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_MEDIUMS + ` (
        mediumId INTEGER,
        mediumName TEXT NOT NULL,
        mediumDescription TEXT NOT NULL DEFAULT '',
        mediumCreatedAt DATETIME NOT NULL,
        mediumModifiedAt DATETIME NOT NULL,
        environmentId INTEGER NOT NULL,
        PRIMARY KEY (mediumId),
        FOREIGN KEY (environmentId) REFERENCES environments(environmentId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_PLANTS + ` (
        plantId INTEGER,
        plantName TEXT NOT NULL,
        plantClonedFrom INTEGER DEFAULT NULL,
        plantSex TEXT DEFAULT NULL,
        plantDescription TEXT NOT NULL DEFAULT '',
        plantCreatedAt DATETIME NOT NULL,
        plantModifiedAt DATETIME NOT NULL,
        genotypeId INTEGER NOT NULL,
        PRIMARY KEY (plantId),
        FOREIGN KEY (plantClonedFrom) REFERENCES plants(plantId) ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY(genotypeId) REFERENCES genotypes(genotypeId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // We have to this after plant & generation creation becaus of the
    // foreign keys.
    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_GENERATION_PARENTS + ` (
        parentId INTEGER,
        generationId NOT NULL,
        plantId NOT NULL,
        PRIMARY KEY (parentId),
        FOREIGN KEY (generationId) REFERENCES generations(generationId) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (plantId) REFERENCES plants(plantId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await sqlite.run(`
      CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_PLANT_LOGS + ` (
        plantLogId INTEGER,
        plantLogTimestamp DATETIME NOT NULL,
        plantLogType TEXT NOT NULL,
        plantLogValue BLOB NOT NULL,
        plantLogCreatedAt DATETIME NOT NULL,
        plantLogModifiedAt DATETIME NOT NULL,
        plantId INTEGER NOT NULL,
        PRIMARY KEY (plantLogId),
        FOREIGN KEY (plantId) REFERENCES plants(plantId) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
};
