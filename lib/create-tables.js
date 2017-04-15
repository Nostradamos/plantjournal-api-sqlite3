const sqlite = require('sqlite');
const Constants = require('./constants');

module.exports =  async function createTables() {
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + Constants.tableFamilies + ` (
      familyId INTEGER,
      familyName text NOT NULL,
      PRIMARY KEY (familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + Constants.tableGenerations + ` (
      generationId INTEGER,
      generationName text NOT NULL,
      familyId INTEGER NOT NULL,
      PRIMARY KEY (generationId),
      FOREIGN KEY(familyId) REFERENCES families(familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + Constants.tableGenotypes + ` (
      genotypeId INTEGER,
      genotypeName text,
      generationId INTEGER NOT NULL,
      PRIMARY KEY (genotypeId),
      FOREIGN KEY(generationId) REFERENCES generations(generationId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + Constants.tablePlants + ` (
      plantId INTEGER,
      plantName text NOT NULL,
      plantClonedFrom INTEGER DEFAULT NULL,
      plantSex text DEFAULT NULL,
      genotypeId INTEGER NOT NULL,
      PRIMARY KEY (plantId),
      FOREIGN KEY (plantClonedFrom) REFERENCES plants(plantId),
      FOREIGN KEY(genotypeId) REFERENCES genotypes(genotypeId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS ` + Constants.tableGenerationParents + ` (
      parentId INTEGER,
      generationId NOT NULL,
      plantId NOT NULL,
      PRIMARY KEY (parentId),
      FOREIGN KEY (generationId) REFERENCES generations(generationId),
      FOREIGN KEY (plantId) REFERENCES plants(plantId)
    );
  `);

}
