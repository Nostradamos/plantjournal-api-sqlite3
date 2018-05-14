/* eslint-env node, mocha */
'use strict';

require('should');

const UtilsReturnObject = require('../../../src/utils/utils-return-object');

describe(`utils/utils-return-object`, () => {
  describe(`#addFamily()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {families: {}};
    });

    it(`should add family object to returnObject.families[familyId]`, () => {
      UtilsReturnObject.addFamily(
        {familyId: 42, familyName: 'testFam'}, returnObject);
      returnObject.should.deepEqual({
        families: {
          42: {
            familyId: 42,
            familyName: 'testFam'
          }
        }
      });
    });

    it(`should not add family object to returnObject.families if  row.familyName is not set`, () => {
      UtilsReturnObject.addFamily({familyId: 42}, returnObject);
      returnObject.should.deepEqual({
        families: {}
      });
    });

    it(`should add family object to returnObject.familys[familyId] if  row.familyName is not defined but forceAdd=true`, () => {
      UtilsReturnObject.addFamily({familyId: 42}, returnObject, true);
      returnObject.should.deepEqual({
        families: {
          42: {
            familyId: 42,
          }
        },
      });
    });

    it(`should not add family to returnObject if familyId is null`, () => {
      UtilsReturnObject.addFamily({familyId: null}, returnObject, true);
      returnObject.should.deepEqual({
        families: {},
      });
    });

    it(`should split the row.familyGenerations string into an array of integers`, () => {
      UtilsReturnObject.addFamily(
        {familyId: 3, familyGenerations: '42,43,1'}, returnObject, true);
      returnObject.should.deepEqual({
        families: {
          3: {
            familyId: 3,
            familyGenerations: [42,43,1]
          }
        },
      });
    });
  });

  describe(`#addGeneration()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {families: {}, generations: {}};
    });

    it(`should add generation object to  returnObject.generations[generationId]`, () => {
      let row = {familyId: 42, generationId: 13, generationName: 'F4'};
      UtilsReturnObject.addGeneration(row, returnObject);

      returnObject.should.deepEqual({
        families: {},
        generations: {
          13: {
            generationId: 13,
            generationName: 'F4',
            familyId: 42
          }
        }
      });
    });

    it(`should split generationParents into an array of integers`, () => {
      let row = {familyId: 42, generationId: 13, generationParents: '13,14'};
      UtilsReturnObject.addGeneration(row, returnObject);

      returnObject.should.deepEqual({
        families: {},
        generations: {
          13: {
            generationId: 13,
            generationParents: [13,14],
            familyId: 42
          }
        }
      });
    });

    it(`should not add generation object to  returnObject.generations[generationId] if the only generation*  field which is set is row.generationId`, () => {
      UtilsReturnObject.addGeneration(
        {familyId: 42, generationId: 13}, returnObject);
      returnObject.should.deepEqual({families: {}, generations: {}});
    });

    it(`should add generation object to returnObject.generations[generationId] if row.generationName is  defined but forceAdd=true`, () => {
      UtilsReturnObject.addGeneration(
        {familyId: 42, generationId: 13}, returnObject, true);
      returnObject.should.deepEqual({
        families: {},
        generations: {
          13: {
            generationId: 13,
            familyId: 42
          }
        },
      });
    });

    it(`should add generation object to returnObject... if  row.generationParents is defined and it should split it and cast to integers`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationParents: '27,100'
      };

      UtilsReturnObject.addGeneration(row, returnObject);
      returnObject.generations.should.deepEqual({
        13: {
          generationId: 13,
          generationParents: [27, 100],
          familyId: 42
        }
      });
    });

    it(`should set returnObject.generationParents = [] if row.generationParents = null`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationParents: null
      };


      UtilsReturnObject.addGeneration(row, returnObject);
      returnObject.generations.should.deepEqual({
        13: {
          generationId: 13,
          generationParents: [],
          familyId: 42
        }
      });
    });

    it(`should not add anything to returnObject if row.generationId is null`, () => {
      UtilsReturnObject.addGeneration(
        {familyId: 42, generationId: null, generationName: null}, returnObject);
      returnObject.generations.should.deepEqual({});
    });
  });

  describe(`#addGenotype`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {families: {}, generations: {}, genotypes: {}};
    });

    it(`should add genotype object to returnObject.genotypes[genotypeId]`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
        genotypeName: 'testpheno'
      };

      UtilsReturnObject.addGenotype(row, returnObject);

      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {
          1337: {
            genotypeId: 1337,
            genotypeName: 'testpheno',
            generationId: 13,
            familyId: 42
          }
        }
      });
    });

    it(`should not add genotype object to returnObject if row.genotypeName is not defined`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
      };

      UtilsReturnObject.addGenotype(row, returnObject);
      returnObject.should.deepEqual({
        families: {}, generations: {}, genotypes: {}
      });
    });

    it(`should add genotype object to returnObject if row.genotypeName is not defined but forceAdd=true`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
      };

      UtilsReturnObject.addGenotype(row, returnObject, true);
      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {
          1337: {
            genotypeId: 1337,
            generationId: 13,
            familyId: 42
          }
        }
      });
    });

    it(`should not add genotype to returnObject if row.genotypeId is null`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: null,
        genotypeName: null,
      };

      UtilsReturnObject.addGenotype(row, returnObject);
      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {}
      });
    });
  });

  describe(`#addPlant()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {
        families: {},
        generations: {},
        genotypes: {},
        plants: {}
      };
    });

    it(`should add plant object to returnObject.plants[plantId]`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
        genotypeName: 'testpheno',
        plantId: 12,
        plantName: 'testPlant',
        plantClonedFrom: null,
        plantSex: 'male',
        mediumId: 11,
        mediumName: 'blubb',
        environmentId: 3,
        environmentName: 'xyz'
      };

      UtilsReturnObject.addPlant(row, returnObject);
      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {},
        plants: {
          12: {
            plantId: 12,
            plantName: 'testPlant',
            plantClonedFrom: null,
            plantSex: 'male',
            genotypeId: 1337,
            generationId: 13,
            familyId: 42,
            mediumId: 11,
            environmentId: 3
          }
        }
      });
    });

    it(`should not add plant object to returnObject.plants[plantId] if only id attributes (plantId, generationId...) are defined  (and forceAdd=false)`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
        genotypeName: 'testpheno',
        plantId: 12
      };

      UtilsReturnObject.addPlant(row, returnObject);
      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {},
        plants: {}
      });
    });

    it(`should add plant object to returnObject.plants[plantId] if  row.plantName is not defined but forceAdd=true`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        generationName: 'F4',
        genotypeId: 1337,
        plantId: 12,
        mediumId: 24,
        environmentId: 11
      };

      UtilsReturnObject.addPlant(row, returnObject, true);
      returnObject.should.deepEqual({
        families: {},
        generations: {},
        genotypes: {},
        plants: {
          12: {
            plantId: 12,
            genotypeId: 1337,
            generationId: 13,
            familyId: 42,
            mediumId: 24,
            environmentId: 11
          }
        }
      });
    });

    it(`should set environmentId:null if row.environmentId is not defined`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        genotypeId: 1337,
        plantId: 12,
        plantName: 'testPlant',
        mediumId: 24
      };

      UtilsReturnObject.addPlant(row, returnObject);
      returnObject.plants.should.deepEqual({
        12: {
          plantId: 12,
          plantName: 'testPlant',
          genotypeId: 1337,
          generationId: 13,
          familyId: 42,
          mediumId: 24,
          environmentId: null
        }
      });
    });

    it(`should set mediumId: null if row.mediumId is not defined`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        genotypeId: 1337,
        plantId: 12,
        plantName: 'testPlant'
      };

      UtilsReturnObject.addPlant(row, returnObject);
      returnObject.plants.should.deepEqual({
        12: {
          plantId: 12,
          plantName: 'testPlant',
          genotypeId: 1337,
          generationId: 13,
          familyId: 42,
          mediumId: null,
          environmentId: null
        }
      });
    });

    it(`should not plant to returnObject if plantId is null`, () => {
      let row = {
        familyId: 42,
        generationId: 13,
        genotypeId: 1337,
        plantId: null,
        plantName: null
      };

      UtilsReturnObject.addPlant(row, returnObject);
      returnObject.plants.should.deepEqual({});
    });
  });

  describe(`#addEnvironment()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {environments: {}};
    });

    it(`should add environment to returnObject`, () => {
      let row = {
        environmentId: 13,
        environmentName: 'Testenv'
      };

      UtilsReturnObject.addEnvironment(row, returnObject);
      returnObject.should.deepEqual({
        environments: {
          13: {
            environmentId: 13,
            environmentName: 'Testenv'
          }
        }
      });
    });

    it(`should not add environment to returnObject if environmentId is null`, () => {
      let row = {
        environmentId: null,
        environmentName: null
      };

      UtilsReturnObject.addEnvironment(row, returnObject);
      returnObject.should.deepEqual({
        environments: {}
      });
    });

    it(`should split environmentMediums string into integer array`, () => {
      let row = {
        environmentId: 42,
        environmentName: 'foobar',
        environmentMediums: '13,12'
      };

      UtilsReturnObject.addEnvironment(row, returnObject);
      returnObject.should.deepEqual({
        environments: {
          42: {
            environmentId: 42,
            environmentName: 'foobar',
            environmentMediums: [13,12]
          }
        }
      });
    });
  });

  describe(`addJournal()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {journals: {}};
    });

    it(`should add journal to returnObject`, () => {
      let row = {
        journalId: 14,
        journalDatetime: 122223,
        journalType: 'log',
        journalValue: '"foobar"',
        plantId: 4
      };

      UtilsReturnObject.addJournal(row, returnObject);
      returnObject.should.deepEqual({
        journals: {
          14: {
            journalId: 14,
            journalDatetime: 122223,
            journalType: 'log',
            journalValue: 'foobar',
            plantId: 4
          }
        }
      });

      it(`should not add journal if journalId is null`, () => {
        let row = {
          journalId: null,
          journalDatetime: null,
          journalType: null,
          journalValue: null,
          plantId: 4
        };

        UtilsReturnObject.addJournal(row, returnObject);
        returnObject.should.deepEqual({
          journals: {}
        });
      });
    });
  });

  describe(`#addMedium()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {environments: {}, mediums: {}};
    });

    it(`should add medium to returnObject`, () => {
      let row = {
        mediumId: 13,
        mediumName: 'barfoo',
        environmentId: 17
      };

      UtilsReturnObject.addMedium(row, returnObject);
      returnObject.should.deepEqual({
        environments: {},
        mediums: {
          13: {
            mediumId: 13,
            mediumName: 'barfoo',
            environmentId: 17
          }
        },
      });
    });

    it(`should not add medium if mediumId is null`, () => {
      let row = {
        mediumId: null,
        mediumName: null,
        environmentId: 17
      };

      UtilsReturnObject.addMedium(row, returnObject);
      returnObject.should.deepEqual({
        environments: {},
        mediums: {},
      });
    });
  });

  describe(`#addFoundAndRemaining()`, () => {
    let returnObject;

    beforeEach(() => {
      returnObject = {};
    });

    it(`should calculate remaining count and add with found to returnObject`, () => {
      let options = {offset: 42};
      let count = {count: 130};

      UtilsReturnObject.addFoundAndRemaining(
        count, 5, returnObject, options);
      returnObject.should.deepEqual({found: 130, remaining: 83});
    });

    it(`should calculate remaining count if options.offset is not defined and add with found to returnObject`, () => {
      let options = {};
      let count = {count: 42};

      UtilsReturnObject.addFoundAndRemaining(count, 30, returnObject, options);
      returnObject.should.deepEqual({found: 42, remaining: 12});
    });

    it(`should return 0 if lenRows + offset == count`, () => {
      let options = {offset: 125};
      let count = {count: 130};

      UtilsReturnObject.addFoundAndRemaining(count, 5, returnObject, options);
      returnObject.should.deepEqual({found: 130, remaining: 0});
    });

    it(`should return 0 if lenRows + offset >= count`, () => {
      let options = {offset: 127};
      let count = {count: 130};

      UtilsReturnObject.addFoundAndRemaining(count, 5, returnObject, options);
      returnObject.should.deepEqual({found: 130, remaining: 0});
    });

    it(`should return 0 if offset > found`, () => {
      let options = {offset: 500};
      let count = {count: 130};

      UtilsReturnObject.addFoundAndRemaining(count, 5, returnObject, options);
      returnObject.should.deepEqual({found: 130, remaining: 0});
    });
  });
});
