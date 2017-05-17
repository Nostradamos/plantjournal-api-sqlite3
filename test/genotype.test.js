const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');
const _ = require('lodash');

const helpers = require('./helper-functions');

describe('Genotype()', function() {
  describe('#create()', function() {
    let pj;

    beforeEach(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
    });

    it('should create a new genotypes entry and return Genotypes Object', async function() {
      let genotype = await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
      let [createdAt, modifiedAt] = [genotype.genotypes[1].genotypeCreatedAt, genotype.genotypes[1].genotypeModifiedAt]
      genotype.should.deepEqual({
        'genotypes': {
          '1': {
            'genotypeId': 1,
            'genotypeName': 'testGenotype1',
            'generationId': 1,
            'genotypeCreatedAt': createdAt,
            'genotypeModifiedAt': modifiedAt
          }
        }
      });

      let rows = await sqlite.all('SELECT genotypeId, genotypeName, generationId, genotypeCreatedAt, genotypeModifiedAt FROM genotypes');
      rows.should.deepEqual([{'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1, 'genotypeCreatedAt': createdAt, 'genotypeModifiedAt': modifiedAt}]);
    });

    it('should be possible to create a new genotype with options.genotypeName = null or options.genotypeName = undefined (or not even set)', async function() {
      let genotype = await pj.Genotype.create({generationId: 1});
      let [createdAt, modifiedAt] = [genotype.genotypes[1].genotypeCreatedAt, genotype.genotypes[1].genotypeModifiedAt]
      genotype.should.deepEqual({
        'genotypes': {
          '1': {
            'genotypeId': 1,
            'genotypeName': null,
            'genotypeCreatedAt': createdAt,
            'genotypeModifiedAt': modifiedAt,
            'generationId': 1,
          }
        }
      });
    });

    it('should throw error if options is not set or not an associative array', async function() {
      let tested = 0;
      for(value in [[1,2], null, 'string', 1, true, undefined]) {
        await pj.Genotype.create(value)
          .should.be.rejectedWith('First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it('should throw an error if options.generationId is not set', async function() {
      await pj.Genotype.create({})
        .should.be.rejectedWith('options.generationId has to be set');
    });

    it('should throw error if options.generationId is not an integer', async function() {
      await pj.Genotype.create({generationId: "1"})
        .should.be.rejectedWith('options.generationId has to be an integer');
    });

    it('should throw an error if options.generationId does not reference a generation', async function() {
      await pj.Genotype.create({generationId: 1337})
        .should.be.rejectedWith('options.generationId does not reference an existing Generation');
    });

    it('should throw error if options.genotypeName is not a string', async function() {
      await pj.Genotype.create({generationId: 1, genotypeName: 1})
        .should.be.rejectedWith('options.genotypeName has to be a string');
    });

    afterEach(async function() {
      await pj.disconnect();
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
      await pj.Generation.create({familyId: 2, generationName: 'S1'});
      await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
      await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
      await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
      await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2'});
      await pj.Generation.create({familyId: 2, generationName: 'generationWithParents', generationParents: [1,2]});
      await pj.Genotype.create({generationId: 4, genotypeName: 'testGenotype4'});
    });

    it('should find genotypes, referenced generations and families', async function() {
      let genotypes = await pj.Genotype.find();
      genotypes.should.containDeep(
        {
          'found': 4,
          'remaining': 0,
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
            },
            '4': {
              'genotypeId': 4,
              'genotypeName': 'testGenotype4',
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
      helpers
        .allGenotypesShouldHaveCreatedAtAndModifiedAtFields(genotypes);
      helpers
        .allGenerationsShouldHaveCreatedAtAndModifiedAtFields(genotypes);
      helpers
        .allFamiliesShouldHaveCreatedAtAndModifiedAtFields(genotypes);
    });

    it('should not have an empty families property object if familyName is NOT in options.fields', async function() {
      let genotypes = await pj.Genotype.find(
        {
          'fields': ['familyId', 'generationName']
        }
      );
      genotypes.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'genotypes': {
         '1': { genotypeId: 1, generationId: 1, familyId: 1 },
         '2': { genotypeId: 2, generationId: 2, familyId: 1 },
         '3': { genotypeId: 3, generationId: 3, familyId: 2 },
         '4': { genotypeId: 4, generationId: 4, familyId: 2 },
        },
        'generations': {
          '1': { generationId: 1, familyId: 1, generationName: 'F1' },
          '2': { generationId: 2, familyId: 1, generationName: 'F2' },
          '3': { generationId: 3, familyId: 2, generationName: 'S1' },
          '4': { generationId: 4, familyId: 2, generationName: 'generationWithParents' },
         },
      })
    });

    it('should not have an empty generations property object if not generationName is in options.fields', async function() {
      let genotypes = await pj.Genotype.find(
        {
          'fields': ['familyId']
        }
      );
      genotypes.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'genotypes': {
          '1': { genotypeId: 1, generationId: 1, familyId: 1 },
          '2': { genotypeId: 2, generationId: 2, familyId: 1 },
          '3': { genotypeId: 3, generationId: 3, familyId: 2 },
          '4': { genotypeId: 4, generationId: 4, familyId: 2 }
        }
      });
    });

    it('should skip x genotypes specified with options.offset and limit the count of results to option.limit', async function() {
      let genotypes = await pj.Genotype.find(
        {
          'fields': ['genotypeName'],
          'limit': 3,
          'offset': 2
        }
      );
      genotypes.should.deepEqual({
        'found': 4,
        'remaining': 0,
        'genotypes': {
          '3': {
            'genotypeId': 3,
            'genotypeName': 'testGenotype3',
            'generationId': 3,
            'familyId': 2
          },
          '4': {
            'genotypeId': 4,
            'genotypeName': 'testGenotype4',
            'generationId': 4,
            'familyId': 2
          }
        }
      });
    });

    it('should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly (for genotype fields)', async function() {
      let genotypes = await pj.Genotype.find(
        {
          'fields': ['genotypeName'],
          'where': {
            'genotypeId': 2
          }
        }
      );
      genotypes.should.deepEqual({
        'found': 1,
        'remaining': 0,
        'genotypes': {
          '2': {
            'genotypeId': 2,
            'genotypeName': 'testGenotype2',
            'generationId': 2,
            'familyId': 1
          }
        }
      });
    });

    it('should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype fields)', async function() {
      let genotypes = await pj.Genotype.find({
        'fields': ['genotypeName'],
        'where': {
          'genotypeName': 'testGenotype3'
        }
      });
      genotypes.should.deepEqual({
        'found': 1,
        'remaining': 0,
        'genotypes': {
          '3': {
            'genotypeId': 3,
            'genotypeName': 'testGenotype3',
            'generationId': 3,
            'familyId': 2
          }
        }
      });
    });

    it('should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches exactly (for family fields)', async function() {
      let genotypes = await pj.Genotype.find({
        'fields': ['genotypeName'],
        'where': {
          'familyName': 'testFamily1'
        }
      });
      genotypes.should.deepEqual({
        'found': 2,
        'remaining': 0,
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
          }
        },
      });
    });

    it('should only return genotypes where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]', async function() {
      let genotypes = await pj.Genotype.find(
        {
          'fields': ['generationParents', 'generationName', 'genotypeName'],
          'where': {'generationParents': [1,2]}
        }
      );
      genotypes.should.deepEqual(
        {
          'found': 1,
          'remaining': 0,
          'genotypes': {
            '4': {
              'genotypeId': 4,
              'genotypeName': 'testGenotype4',
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
