const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');

describe('Phenotype()', function() {
  describe('#create()', function() {
    let pj;

    beforeEach(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
    });

    it('should create a new phenotypes entry and return Phenotypes Object', async function() {
      let phenotype = await pj.Phenotype.create({generationId: 1, phenotypeName: 'testPhenotype1'});
      phenotype.should.deepEqual({
        'phenotypes': {
          '1': {
            'phenotypeId': 1,
            'phenotypeName': 'testPhenotype1',
            'generationId': 1
          }
        }
      });

      let rows = await sqlite.all('SELECT phenotypeId, phenotypeName, generationId FROM phenotypes');
      rows.should.deepEqual([{'phenotypeId': 1, 'phenotypeName': 'testPhenotype1', 'generationId': 1}]);
    });

    it('should be possible to create a new phenotype with options.phenotypeName = null or options.phenotypeName = undefined (or not even set)', async function() {
      let phenotype = await pj.Phenotype.create({generationId: 1});
      phenotype.should.deepEqual({
        'phenotypes': {
          '1': {
            'phenotypeId': 1,
            'phenotypeName': null,
            'generationId': 1
          }
        }
      });
    });

    it('should throw an error if options.generationId is not set', async function() {
      let catched = false;
      try {
        await pj.Phenotype.create({});
      } catch (err) {
        catched = true;
        err.message.should.equal('options.generationId is not set');
      }
      catched.should.be.true();

    });

    it('should throw an error if options.generationId does not reference a generation', async function() {
      let catched = false;
      try {
        await pj.Phenotype.create({generationId: 1337});
      } catch (err) {
        catched = true;
        err.message.should.equal('options.generationId does not reference an existing Generation');
      }
      catched.should.be.true();
    });

    afterEach(async function() {
      await pj.disconnect();
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
      await pj.Generation.create({familyId: 2, generationName: 'generationWithParents', generationParents: [1,2]});
      await pj.Phenotype.create({generationId: 4, phenotypeName: 'testPhenotype4'});
    });

    it('should get phenotypes, referenced generations and families', async function() {
      let phenotypes = await pj.Phenotype.get();
      phenotypes.should.deepEqual(
        {
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
              'phenotypeName': 'testPhenotype4',
              'generationId': 4,
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
              'generationParents': [],
              'familyId': 2
            },
            '4': {
              'generationId': 4,
              'generationName': 'generationWithParents',
              'generationParents': [1, 2],
              'familyId': 2
            },
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
      let phenotypes = await pj.Phenotype.get(
        {
          'fields': ['familyId', 'generationName']
        }
      );
      phenotypes.should.deepEqual({
        phenotypes: {
         '1': { phenotypeId: 1, generationId: 1, familyId: 1 },
         '2': { phenotypeId: 2, generationId: 2, familyId: 1 },
         '3': { phenotypeId: 3, generationId: 3, familyId: 2 },
         '4': { phenotypeId: 4, generationId: 4, familyId: 2 },
        },
        generations: {
          '1': { generationId: 1, familyId: 1, generationName: 'F1' },
          '2': { generationId: 2, familyId: 1, generationName: 'F2' },
          '3': { generationId: 3, familyId: 2, generationName: 'S1' },
          '4': { generationId: 4, familyId: 2, generationName: 'generationWithParents' },
         },
      })
    });

    it('should not have an empty generations property object if not generationName is in options.fields', async function() {
      let phenotypes = await pj.Phenotype.get(
        {
          'fields': ['familyId']
        }
      );
      phenotypes.should.deepEqual({
        phenotypes: {
          '1': { phenotypeId: 1, generationId: 1, familyId: 1 },
          '2': { phenotypeId: 2, generationId: 2, familyId: 1 },
          '3': { phenotypeId: 3, generationId: 3, familyId: 2 },
          '4': { phenotypeId: 4, generationId: 4, familyId: 2 }
        }
      });
    });

    it('should skip x phenotypes specified with options.offset and limit the count of results to option.limit', async function() {
      let phenotypes = await pj.Phenotype.get(
        {
          'fields': ['phenotypeName'],
          'limit': 3,
          'offset': 2
        }
      );
      phenotypes.should.deepEqual({
        'phenotypes': {
          '3': {
            'phenotypeId': 3,
            'phenotypeName': 'testPhenotype3',
            'generationId': 3,
            'familyId': 2
          },
          '4': {
            'phenotypeId': 4,
            'phenotypeName': 'testPhenotype4',
            'generationId': 4,
            'familyId': 2
          }
        }
      });
    });

    it('should only return phenotypes where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly (for phenotype fields)', async function() {
      let phenotypes = await pj.Phenotype.get(
        {
          'fields': ['phenotypeName'],
          'where': {
            'phenotypeId': 2
          }
        }
      );
      phenotypes.should.deepEqual({
        'phenotypes': {
          '2': {
            'phenotypeId': 2,
            'phenotypeName': 'testPhenotype2',
            'generationId': 2,
            'familyId': 1
          }
        }
      });
    });

    it('should only return phenotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for phenotype fields)', async function() {
      let phenotypes = await pj.Phenotype.get({
        'fields': ['phenotypeName'],
        'where': {
          'phenotypeName': 'testPhenotype3'
        }
      });
      phenotypes.should.deepEqual({
        'phenotypes': {
          '3': {
            'phenotypeId': 3,
            'phenotypeName': 'testPhenotype3',
            'generationId': 3,
            'familyId': 2
          }
        }
      });
    });

    it('should only return phenotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches exactly (for family fields)', async function() {
      let phenotypes = await pj.Phenotype.get({
        'fields': ['phenotypeName'],
        'where': {
          'familyName': 'testFamily1'
        }
      });
      phenotypes.should.deepEqual({
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
          }
        },
      });
    });

    it('should only return phenotypes where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]', async function() {
      let phenotypes = await pj.Phenotype.get({'fields': ['generationParents', 'generationName', 'phenotypeName'], 'where': {'generationParents': [1,2]}});
      phenotypes.should.deepEqual(
        {
          'phenotypes': {
            '4': {
              'phenotypeId': 4,
              'phenotypeName': 'testPhenotype4',
              'generationId': 4,
              'familyId': 2
            }
          },
          'generations': {
            '4': {
              'generationId': 4,
              'generationName': 'generationWithParents',
              'generationParents': [1, 2],
              'familyId': 2
            }
          }
        }
      );
    });

    after(async function() {
      await pj.disconnect();
    });
  });
});
