'use strict';

const sqlite = require('sqlite');
const CONSTANTS = require('./constants');

module.exports =  async function createTables() {
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_FAMILIES + ` (
      familyId INTEGER,
      familyName text NOT NULL,
      familyCreatedAt DATETIME NOT NULL,
      familyModifiedAt DATETIME NOT NULL,
      PRIMARY KEY (familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_GENERATIONS + ` (
      generationId INTEGER,
      generationName text NOT NULL,
      generationCreatedAt DATETIME NOT NULL,
      generationModifiedAt DATETIME NOT NULL,
      familyId INTEGER NOT NULL,
      PRIMARY KEY (generationId),
      FOREIGN KEY(familyId) REFERENCES families(familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_GENOTYPES + ` (
      genotypeId INTEGER,
      genotypeName text,
      genotypeCreatedAt DATETIME NOT NULL,
      genotypeModifiedAt DATETIME NOT NULL,
      generationId INTEGER NOT NULL,
      PRIMARY KEY (genotypeId),
      FOREIGN KEY(generationId) REFERENCES generations(generationId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + CONSTANTS.TABLE_PLANTS + ` (
      plantId INTEGER,
      plantName text NOT NULL,
      plantClonedFrom INTEGER DEFAULT NULL,
      plantSex text DEFAULT NULL,
      plantCreatedAt DATETIME NOT NULL,
      plantModifiedAt DATETIME NOT NULL,
      genotypeId INTEGER NOT NULL,
      PRIMARY KEY (plantId),
      FOREIGN KEY (plantClonedFrom) REFERENCES plants(plantId),
      FOREIGN KEY(genotypeId) REFERENCES genotypes(genotypeId)
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
      FOREIGN KEY (generationId) REFERENCES generations(generationId),
      FOREIGN KEY (plantId) REFERENCES plants(plantId)
    );
  `);

}
