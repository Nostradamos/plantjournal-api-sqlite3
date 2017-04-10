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
    });

    it('should get phenotypes, referenced generations and referenced families', async function() {
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
            }
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

    after(async function() {
      pj.disconnect();
    });
  });
});
