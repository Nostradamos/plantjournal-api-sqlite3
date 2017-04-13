const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');

describe('Generation()', function() {
  describe('#create()', function() {
    let pj;

    beforeEach(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Phenotype.create({generationId: 1, phenotypeName: 'testPhenotype1'});
    });

    it('should throw error if neither options.generationId nor options.phenotypeId is set', async function() {
      let catched = false;
      try {
        await pj.Plant.create({});
      } catch(err) {
        catched = true;
        err.message.should.eql('Either options.generationId or options.phenotypeId has to be set');
      }
      catched.should.be.true();
    });

    it('should throw error if options.generationId is not an integer', async function() {
      let catched = false;
      try {
        await pj.Plant.create({generationId: 'test'});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.generationId has to be an integer');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId is not an integer', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: null});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.phenotypeId has to be an integer');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId is not set and options.generationId does not reference an existing generationId', async function() {
      let catched = false;
      try {
        await pj.Plant.create({generationId: 42, plantName: 'test'});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.generationId does not reference an existing Generation');
      }
      catched.should.be.true();
    });

    it('should throw error if options.plantName is not set', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: 2});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.plantName has to be set');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId does not reference an existing phenotypeId', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: 2, plantName: 'test'});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.phenotypeId does not reference an existing Phenotype');
      }
      catched.should.be.true();
    });

    it('should only create a new plant entry if options.phenotypeId is set and return plant object with plant fields + phenotypeId', async function() {
      let plant = await pj.Plant.create({phenotypeId: 1, plantName: 'testPlant1'});
      plant.should.deepEqual({
        'plants': {
          '1': {
            'plantId': 1,
            'plantName': 'testPlant1',
            'phenotypeId': 1
          }
        }
      });
      let rowsPlants = await sqlite.all('SELECT plantId, plantName, phenotypeId FROM plants');
      rowsPlants.should.deepEqual([{'plantId': 1, 'plantName': 'testPlant1', 'phenotypeId': 1}]);
      let rowsPhenotypes = await sqlite.all('SELECT phenotypeId, phenotypeName, generationId FROM phenotypes');
      rowsPhenotypes.should.deepEqual([{'phenotypeId': 1, 'phenotypeName': 'testPhenotype1', 'generationId': 1}]);
    });

    it('should create a new plant and phenotype entry if options.phenotypeId is not set and return plant object + phenotype object', async function() {
      let plant = await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      plant.should.deepEqual({
        'phenotypes': {
          '2': {
            'phenotypeId': 2,
            'phenotypeName': null,
            'generationId': 1
          }
        },
        'plants': {
          '1': {
            'plantId': 1,
            'plantName': 'testPlant1',
            'phenotypeId': 2
          }
        }
      });
    });

    afterEach(async function() {
      pj.disconnect();
    });
  });
  describe('#get()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Family.create({familyName: 'testFamily2'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Generation.create({familyId: 1, generationName: 'F2'});
      await pj.Generation.create({familyId: 2, generationName: 'S1'});
      await pj.Phenotype.create({generationId: 1, phenotypeName: 'testPhenotype1'});
      await pj.Phenotype.create({generationId: 2, phenotypeName: 'testPhenotype2'});
      await pj.Phenotype.create({generationId: 3, phenotypeName: 'testPhenotype3'});
      await pj.Plant.create({phenotypeId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({phenotypeId: 2, plantName: 'testPlant2'});
      await pj.Plant.create({phenotypeId: 3, plantName: 'testPlant3'});
      await pj.Plant.create({generationId: 3, plantName: 'testPlant4'});
    });

    it('should get plants, referenced phenotypes, generations and families', async function() {
      let plants = await pj.Plant.get();
      plants.should.deepEqual(
        {
          'plants': {
            '1': {
              'plantId': 1,
              'plantName': 'testPlant1',
              'phenotypeId': 1,
              'generationId': 1,
              'familyId': 1
            },
            '2': {
              'plantId': 2,
              'plantName': 'testPlant2',
              'phenotypeId': 2,
              'generationId': 2,
              'familyId': 1
            },
            '3': {
              'plantId': 3,
              'plantName': 'testPlant3',
              'phenotypeId': 3,
              'generationId': 3,
              'familyId': 2
            },
            '4': {
              'plantId': 4,
              'plantName': 'testPlant4',
              'phenotypeId': 4,
              'generationId': 3,
              'familyId': 2
            }
          },
          'phenotypes': {
            '1': {
              'phenotypeId': 1,
              'phenotypeName': 'testPhenotype1',
              'generationId': 1,
              'familyId': 1
            },
            '2': {
              'phenotypeId': 2,
              'phenotypeName': 'testPhenotype2',
              'generationId': 2,
              'familyId': 1
            },
            '3': {
              'phenotypeId': 3,
              'phenotypeName': 'testPhenotype3',
              'generationId': 3,
              'familyId': 2
            },
            '4': {
              'phenotypeId': 4,
              'phenotypeName': null,
              'generationId': 3,
              'familyId': 2
            },
          },
          'generations': {
            '1': {
              'generationId': 1,
              'generationName': 'F1',
              'familyId': 1
            },
            '2': {
              'generationId': 2,
              'generationName': 'F2',
              'familyId': 1
            },
            '3': {
              'generationId': 3,
              'generationName': 'S1',
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
    });

    it('should not have an empty families property object if familyName is NOT in options.fields', async function() {
      let plants = await pj.Plant.get(
        {
          'fields': ['familyId', 'generationName', 'phenotypeName']
        }
      );
      plants.should.deepEqual({
        'phenotypes': {
         '1': { 'phenotypeId': 1, 'phenotypeName': 'testPhenotype1', 'generationId': 1, 'familyId': 1 },
         '2': { 'phenotypeId': 2, 'phenotypeName': 'testPhenotype2', 'generationId': 2, 'familyId': 1 },
         '3': { 'phenotypeId': 3, 'phenotypeName': 'testPhenotype3', 'generationId': 3, 'familyId': 2 },
         '4': { 'phenotypeId': 4, 'phenotypeName': null, 'generationId': 3, 'familyId': 2 },
        },
        'generations': {
          '1': { 'generationId': 1, 'familyId': 1, 'generationName': 'F1' },
          '2': { 'generationId': 2, 'familyId': 1, 'generationName': 'F2' },
          '3': { 'generationId': 3, 'familyId': 2, 'generationName': 'S1' }
        },
        'plants': {
          '1': { 'plantId': 1, 'phenotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'phenotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'phenotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'phenotypeId': 4, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should not have an empty generations property object if generationName is NOT in options.fields', async function() {
      let plants = await pj.Plant.get(
        {
          'fields': ['familyId', 'phenotypeName']
        }
      );
      plants.should.deepEqual({
        'phenotypes': {
         '1': { 'phenotypeId': 1, 'phenotypeName': 'testPhenotype1', 'generationId': 1, 'familyId': 1 },
         '2': { 'phenotypeId': 2, 'phenotypeName': 'testPhenotype2', 'generationId': 2, 'familyId': 1 },
         '3': { 'phenotypeId': 3, 'phenotypeName': 'testPhenotype3', 'generationId': 3, 'familyId': 2 },
         '4': { 'phenotypeId': 4, 'phenotypeName': null, 'generationId': 3, 'familyId': 2 },
        },
        'plants': {
          '1': { 'plantId': 1, 'phenotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'phenotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'phenotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'phenotypeId': 4, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should not have an empty phenotypes object if phenotyeName is NOT in options.fields', async function() {
      let plants = await pj.Plant.get(
        {
          'fields': ['familyId']
        }
      );
      plants.should.deepEqual({
        'plants': {
          '1': { 'plantId': 1, 'phenotypeId': 1, 'generationId': 1, 'familyId': 1 },
          '2': { 'plantId': 2, 'phenotypeId': 2, 'generationId': 2, 'familyId': 1 },
          '3': { 'plantId': 3, 'phenotypeId': 3, 'generationId': 3, 'familyId': 2 },
          '4': { 'plantId': 4, 'phenotypeId': 4, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it('should skip the first 3 plants if options.offset = 3 and limit plants to 1 if options.limit=1', async function() {
      let plants = await pj.Plant.get({'offset': 2, 'limit': 1, 'fields': ['plantName']});
      plants.should.deepEqual({
        'plants': {
          '3': { 'plantId': 3, 'plantName': 'testPlant3', 'phenotypeId': 3, 'generationId': 3, 'familyId': 2 },
        }
      })
    });

    it('should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for plant fields)', async function() {
      let plants = await pj.Plant.get({'where': {'plantName': 'testPlant3'}, 'fields': ['plantId']});
      plants.should.deepEqual({
        'plants': {
          '3': {'plantId': 3, 'phenotypeId': 3, 'generationId': 3, 'familyId': 2}
        }

      })
    });

    it('should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for phenotype fields)', async function() {
      let plants = await pj.Plant.get({'where': {'phenotypeName': 'testPhenotype3'}, 'fields': ['plantId']});
      plants.should.deepEqual({
        'plants': {
          '3': {'plantId': 3, 'phenotypeId': 3, 'generationId': 3, 'familyId': 2}
        }

      })
    });

    after(async function() {
      await pj.disconnect();
    });
  });
});
