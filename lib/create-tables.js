const sqlite = require('sqlite');

module.exports =  async function createTables() {
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS families (
      familyId INTEGER,
      familyName text NOT NULL,
      PRIMARY KEY (familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS generations (
      generationId INTEGER,
      generationName text NOT NULL,
      familyId INTEGER NOT NULL,
      PRIMARY KEY (generationId),
      FOREIGN KEY(familyId) REFERENCES families(familyId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS phenotypes (
      phenotypeId INTEGER,
      phenotypeName text,
      generationId INTEGER NOT NULL,
      PRIMARY KEY (phenotypeId),
      FOREIGN KEY(generationId) REFERENCES generations(generationId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS plants (
      plantId INTEGER,
      plantName text NOT NULL,
      phenotypeId INTEGER NOT NULL,
      PRIMARY KEY (plantId),
      FOREIGN KEY(phenotypeId) REFERENCES phenotypes(phenotypeId)
    );
  `);
  await sqlite.run(`
    CREATE TABLE IF NOT EXISTS generation_parents (
      parentId INTEGER,
      generationId NOT NULL,
      plantId NOT NULL,
      PRIMARY KEY (parentId),
      FOREIGN KEY (generationId) REFERENCES generations(generationId),
      FOREIGN KEY (plantId) REFERENCES plants(plantId)
    );
  `);
}
