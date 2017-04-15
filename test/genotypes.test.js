const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');

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
      genotype.should.deepEqual({
        'genotypes': {
          '1': {
            'genotypeId': 1,
            'genotypeName': 'testGenotype1',
            'generationId': 1
          }
        }
      });

      let rows = await sqlite.all('SELECT genotypeId, genotypeName, generationId FROM genotypes');
      rows.should.deepEqual([{'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1}]);
    });

    it('should be possible to create a new genotype with options.genotypeName = null or options.genotypeName = undefined (or not even set)', async function() {
      let genotype = await pj.Genotype.create({generationId: 1});
      genotype.should.deepEqual({
        'genotypes': {
          '1': {
            'genotypeId': 1,
            'genotypeName': null,
            'generationId': 1
          }
        }
      });
    });

    it('should throw an error if options.generationId is not set', async function() {
      let catched = false;
      try {
        await pj.Genotype.create({});
      } catch (err) {
        catched = true;
        err.message.should.equal('options.generationId is not set');
      }
      catched.should.be.true();

    });

    it('should throw an error if options.generationId does not reference a generation', async function() {
      let catched = false;
      try {
        await pj.Genotype.create({generationId: 1337});
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
      await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
      await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
      await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
      await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2'});
      await pj.Generation.create({familyId: 2, generationName: 'generationWithParents', generationParents: [1,2]});
      await pj.Genotype.create({generationId: 4, genotypeName: 'testGenotype4'});
    });

    it('should get genotypes, referenced generations and families', async function() {
      let genotypes = await pj.Genotype.get();
      genotypes.should.deepEqual(
        {
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
    });

    it('should not have an empty families property object if familyName is NOT in options.fields', async function() {
      let genotypes = await pj.Genotype.get(
        {
          'fields': ['familyId', 'generationName']
        }
      );
      genotypes.should.deepEqual({
        genotypes: {
         '1': { genotypeId: 1, generationId: 1, familyId: 1 },
         '2': { genotypeId: 2, generationId: 2, familyId: 1 },
         '3': { genotypeId: 3, generationId: 3, familyId: 2 },
         '4': { genotypeId: 4, generationId: 4, familyId: 2 },
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
      let genotypes = await pj.Genotype.get(
        {
          'fields': ['familyId']
        }
      );
      genotypes.should.deepEqual({
        genotypes: {
          '1': { genotypeId: 1, generationId: 1, familyId: 1 },
          '2': { genotypeId: 2, generationId: 2, familyId: 1 },
          '3': { genotypeId: 3, generationId: 3, familyId: 2 },
          '4': { genotypeId: 4, generationId: 4, familyId: 2 }
        }
      });
    });

    it('should skip x genotypes specified with options.offset and limit the count of results to option.limit', async function() {
      let genotypes = await pj.Genotype.get(
        {
          'fields': ['genotypeName'],
          'limit': 3,
          'offset': 2
        }
      );
      genotypes.should.deepEqual({
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
      let genotypes = await pj.Genotype.get(
        {
          'fields': ['genotypeName'],
          'where': {
            'genotypeId': 2
          }
        }
      );
      genotypes.should.deepEqual({
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
      let genotypes = await pj.Genotype.get({
        'fields': ['genotypeName'],
        'where': {
          'genotypeName': 'testGenotype3'
        }
      });
      genotypes.should.deepEqual({
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
      let genotypes = await pj.Genotype.get({
        'fields': ['genotypeName'],
        'where': {
          'familyName': 'testFamily1'
        }
      });
      genotypes.should.deepEqual({
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
      let genotypes = await pj.Genotype.get({'fields': ['generationParents', 'generationName', 'genotypeName'], 'where': {'generationParents': [1,2]}});
      genotypes.should.deepEqual(
        {
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
