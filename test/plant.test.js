const should = require('should');
const sqlite = require('sqlite');

const plantJournal = require('../lib/pj');
const helpers = require('./helper-functions');

describe('Plant()', function() {
  describe('#create()', function() {
    let pj;

    beforeEach(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
    });

    it('should throw error if options is not set or not an associative array', async function() {
      let tested = 0;
      for(value in [[1,2], null, 'string', 1, true, undefined]) {
        await pj.Family.create(value)
          .should.be.rejectedWith('First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });


    it('should throw error if neither options.generationId nor options.genotypeId is set', async function() {
      await pj.Plant.create({plantName: 'testPlant'})
        .should.be.rejectedWith('Either options.generationId, options.genotypeId or options.plantClonedFrom has to be set');
    });

    it('should throw error if options.generationId is not an integer', async function() {
      await pj.Plant.create({plantName: 'testPlant', generationId: 'test'})
        .should.be.rejectedWith('options.generationId has to be an integer');
    });

    it('should throw error if options.genotypeId is not an integer', async function() {
      await pj.Plant.create({plantName: 'testPlant', genotypeId: null})
        .should.be.rejectedWith('options.genotypeId has to be an integer');
    });

    it('should throw error if options.generationId does not reference an existing generationId', async function() {
      await pj.Plant.create({generationId: 42, plantName: 'test'})
        .should.be.rejectedWith('options.generationId does not reference an existing Generation');
    });

    it('should throw error if options.plantName is not set', async function() {
      await pj.Plant.create({genotypeId: 2})
        .should.be.rejectedWith('options.plantName has to be set');
    });

    it('should throw error if options.plantName is not a string', async function() {
      await pj.Plant.create({genotypeId: 2, plantName: 1})
        .should.be.rejectedWith('options.plantName has to be a string');
    });

    it('should throw error if options.plantSex is not a valid sex', async function() {
        await pj.Plant.create({genotypeId: 2, plantName: 'test', plantSex: 'notavalidsex'})
          .should.be.rejectedWith('options.plantSex has to be null, male, female or hermaphrodite');
    });

    it('should throw error if options.genotypeId does not reference an existing genotypeId', async function() {
      await pj.Plant.create({genotypeId: 2, plantName: 'test'})
        .should.be.rejectedWith('options.genotypeId does not reference an existing Genotype');
    });

    it('should only create a new plant entry if options.genotypeId is set and return plant object with plant fields + genotypeId', async function() {
      let plant = await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
      let [createdAt, modifiedAt] = [plant.plants[1].plantCreatedAt, plant.plants[1].plantModifiedAt];
      plant.should.deepEqual({
        'plants': {
          '1': {
            'plantId': 1,
            'plantName': 'testPlant1',
            'plantClonedFrom': null,
            'plantSex': null,
            'plantCreatedAt': createdAt,
            'plantModifiedAt': modifiedAt,
            'genotypeId': 1,
          }
        }
      });
      let rowsPlants = await sqlite.all('SELECT plantId, plantName, plantClonedFrom, genotypeId, plantCreatedAt, plantModifiedAt FROM plants');
      rowsPlants.should.deepEqual([{'plantId': 1, 'plantName': 'testPlant1', 'plantClonedFrom': null, 'genotypeId': 1, 'plantCreatedAt': createdAt, 'plantModifiedAt': modifiedAt}]);
      let rowsGenotypes = await sqlite.all('SELECT genotypeId, genotypeName, generationId FROM genotypes');
      rowsGenotypes.should.deepEqual([{'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1}]);
    });

    it('should create a new plant and genotype entry if options.genotypeId is not set and return plant object + genotype object', async function() {
      let plant = await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      let [createdAtPlant, modifiedAtPlant] = [plant.plants[1].plantCreatedAt, plant.plants[1].plantModifiedAt];
      let [createdAtGenotype, modifiedAtGenotype] = [plant.genotypes[2].genotypeCreatedAt, plant.genotypes[2].genotypeModifiedAt];
      plant.should.deepEqual({
        'genotypes': {
          '2': {
            'genotypeId': 2,
            'genotypeName': null,
            'generationId': 1,
            'genotypeCreatedAt': createdAtGenotype,
            'genotypeModifiedAt': modifiedAtGenotype
          }
        },
        'plants': {
          '1': {
            'plantId': 1,
            'plantName': 'testPlant1',
            'plantClonedFrom': null,
            'plantSex': null,
            'genotypeId': 2,
            'plantCreatedAt': createdAtPlant,
            'plantModifiedAt': modifiedAtPlant
          }
        }
      });
    });

    it('should only create a new plant entry if options.plantClonedFrom is set, and not options.genotypeId is not set but resolve the genotypeId from the mother plant', async function() {
      let plantMother = await pj.Plant.create({genotypeId: 1, plantName: 'motherPlant1'});
      let plantClone = await pj.Plant.create({plantName: 'clonePlant2', plantClonedFrom: 1});
      let [createdAtClone, modifiedAtClone] = [plantClone.plants[2].plantCreatedAt, plantClone.plants[2].plantModifiedAt];
      createdAtClone.should.eql(modifiedAtClone);
      plantClone.should.deepEqual({
        'plants': {
          '2': {
            'plantId': 2,
            'plantName': 'clonePlant2',
            'plantClonedFrom': 1,
            'plantSex': null,
            'genotypeId': 1,
            'plantCreatedAt': createdAtClone,
            'plantModifiedAt': modifiedAtClone
          }
        }
      });
      let rowsPlants = await sqlite.all('SELECT plantId, plantName, plantClonedFrom, plantSex, genotypeId FROM plants');
      rowsPlants.should.deepEqual(
        [
          {'plantId': 1, 'plantName': 'motherPlant1', 'plantClonedFrom': null, 'plantSex': null, 'genotypeId': 1},
          {'plantId': 2, 'plantName': 'clonePlant2', 'plantClonedFrom': 1, 'plantSex': null, 'genotypeId': 1}
        ]
      );
      let rowsGenotypes = await sqlite.all('SELECT genotypeId, genotypeName, generationId FROM genotypes');
      rowsGenotypes.should.deepEqual([{'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1}]);
    });

    it('should throw error if options.plantClonedFrom does not reference an existing plant', async function() {
      await pj.Plant.create({plantName: 'clonePlant2', plantClonedFrom: 1})
        .should.be.rejectedWith('options.plantClonedFrom does not reference an existing Plant');
    });

    it('should throw error if options.plantClonedFrom is not an integer', async function() {
      await pj.Plant.create({plantName: 'clonePlant2', plantClonedFrom: 'not an integer'})
        .should.be.rejectedWith('options.plantClonedFrom has to be an integer');
    });

    afterEach(async function() {
      pj.disconnect();
    });
  });
  describe('#find()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Family.create({familyName: 'testFamily2'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Generation.create({familyId: 1, generationName: 'F2'});
      await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
      await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
      await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2', plantSex: 'male'});

      await pj.Generation.create({familyId: 2, generationName: 'S1', generationParents: [1,2]});
      await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
      await pj.Plant.create({genotypeId: 3, plantName: 'testPlant3', plantSex: 'male'});
      await pj.Plant.create({plantName: 'testPlant4', plantClonedFrom: 3, plantSex: 'female'});
    });

    it('should find plants, referenced genotypes, generations and families', async function() {
      let plants = await pj.Plant.find();
      plants.should.containDeep(
        {
          'found': 4,
          'remaining': 0,
          'plants': {
            '1': {
              'plantId': 1,
              'plantName': 'testPlant1',
              'plantClonedFrom': null,
              'plantSex': null,
              'genotypeId': 1,
              'generationId': 1,
              'familyId': 1
            },
            '2': {
              'plantId': 2,
              'plantName': 'testPlant2',
              'plantClonedFrom': null,
              'plantSex': 'male',
              'genotypeId': 2,
              'generationId': 2,
              'familyId': 1
            },
            '3': {
              'plantId': 3,
              'plantName': 'testPlant3',
              'plantClonedFrom': null,
              'plantSex': 'male',
              'genotypeId': 3,
              'generationId': 3,
              'familyId': 2
            },
            '4': {
              'plantId': 4,
              'plantName': 'testPlant4',
              'plantClonedFrom': 3,
              'plantSex': 'female',
              'genotypeId': 3,
              'generationId': 3,
              'familyId': 2
            }
          },
          'genotypes': {
            '1': {
              'genotypeId': 1,
              'genotypeName': 'testGenotype1',
              'generationId': 1,
              'familyId': 1
            },
            '2': {
              'genotypeId': 2,
              'genotypeName': 'testGenotype2',
              'generationId': 2,
              'familyId': 1
            },
            '3': {
              'genotypeId': 3,
              'genotypeName': 'testGenotype3',
              'generationId': 3,
              'familyId': 2
            }
          },
          'generations': {
            '1': {
              'generationId': 1,
              'generationName': 'F1',
              'generationParents': [],
              'familyId': 1
            },
            '2': {
              'generationId': 2,
              'generationName': 'F2',
              'generationParents': [],
              'familyId': 1
            },
            '3': {
              'generationId': 3,
              'generationName': 'S1',
              'generationParents': [1, 2],
              'familyId': 2
            }
          },
          'families': {
            '1': {
              'familyId': 1,
              'familyName': 'testFamily1'
            },
            '2': {
              'familyId': 2,
              'familyName': 'testFamily2'
            }
          }
        }
      );

      helpers
        .allPlantsShouldHaveCreatedAtAndModifiedAtFields(plants);
      helpers
        .allGenotypesShouldHaveCreatedAtAndModifiedAtFields(plants);
      helpers
        .allGenerationsShouldHaveCreatedAtAndModifiedAtFields(plants);
      helpers
        .allFamiliesShouldHaveCreatedAtAndModifiedAtFields(plants);
    });

    it('should not have an empty families property object if familyName is NOT in options.fields', async function() {
      let plants = await pj.Plant.find(
        {
          'fields': ['familyId', 'generationName', 'genotypeName']
        }
      );
      plants.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'genotypes': {
         '1': { 'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1, 'familyId': 1 },
         '2': { 'genotypeId': 2, 'genotypeName': 'testGenotype2', 'generationId': 2, 'familyId': 1 },
         '3': { 'genotypeId': 3, 'genotypeName': 'testGenotype3', 'generationId': 3, 'familyId': 2 }
        },
        'generations': {
          '1': { 'generationId': 1, 'familyId': 1, 'generationName': 'F1' },
          '2': { 'generationId': 2, 'familyId': 1, 'generationName': 'F2' },
          '3': { 'generationId': 3, 'familyId': 2, 'generationName': 'S1' }
        },
        'plants': {
          '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should not have an empty generations property object if generationName is NOT in options.fields', async function() {
      let plants = await pj.Plant.find(
        {
          'fields': ['familyId', 'genotypeName']
        }
      );
      plants.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'genotypes': {
         '1': { 'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1, 'familyId': 1 },
         '2': { 'genotypeId': 2, 'genotypeName': 'testGenotype2', 'generationId': 2, 'familyId': 1 },
         '3': { 'genotypeId': 3, 'genotypeName': 'testGenotype3', 'generationId': 3, 'familyId': 2 }
        },
        'plants': {
          '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should not have an empty genotypes object if phenotyeName is NOT in options.fields', async function() {
      let plants = await pj.Plant.find(
        {
          'fields': ['familyId']
        }
      );
      plants.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'plants': {
          '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should skip the first 3 plants if options.offset = 3 and limit plants to 1 if options.limit=1', async function() {
      let plants = await pj.Plant.find({'offset': 2, 'limit': 1, 'fields': ['plantName']});
      plants.should.deepEqual({
        'found': 4,
        'remaining': 1,
        'plants': {
          '3': { 'plantId': 3, 'plantName': 'testPlant3', 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
        }
      })
    });

    it('should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for plant fields)', async function() {
      let plants = await pj.Plant.find({'where': {'plantName': 'testPlant3'}, 'fields': ['plantId']});
      plants.should.deepEqual({
        'found': 1,
        'remaining': 0,
        'plants': {
          '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
        }

      })
    });

    it('should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype fields)', async function() {
      let plants = await pj.Plant.find({'where': {'genotypeName': 'testGenotype3'}, 'fields': ['plantId']});
      plants.should.deepEqual({
        'found': 2,
        'remaining': 0,
        'plants': {
          '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2},
          '4': {'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
        }
      });
    });

    it('should only return plants where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]', async function() {
      let plants = await pj.Plant.find({'where': {'generationParents': [1,2]}, 'fields': ['plantId', 'plantName', 'generationParents', 'generationName']});
      plants.should.deepEqual({
        'found': 2,
        'remaining': 0,
        'plants': {
          '3': {
            'plantId': 3,
            'plantName': 'testPlant3',
            'genotypeId': 3,
            'generationId': 3,
            'familyId': 2
          },
          '4': {
            'plantId': 4,
            'plantName': 'testPlant4',
            'genotypeId': 3,
            'generationId': 3,
            'familyId': 2
          }
        },
        'generations': {
          '3': {
            'generationId': 3,
            'generationName': 'S1',
            'generationParents': [1, 2],
            'familyId': 2
          }
        }
      })

    });

    after(async function() {
      await pj.disconnect();
    });
  });
});
