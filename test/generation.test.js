const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');

describe('Generation()', function() {
  describe('#create()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testName'});
    });

    it('should create a new generations entry and return generation object', async function() {
      let generation = await pj.Generation.create({'familyId': 1, 'generationName': 'testGeneration'});
      generation.should.deepEqual({
        generations: {
          '1': {
            'generationId': 1,
            'generationName': 'testGeneration',
            'generationParents': [],
            'familyId': 1
          }
        }
      });

      let result = await sqlite.all('SELECT familyId, generationId, generationName FROM generations');
      result.should.deepEqual([{'familyId': 1, 'generationId': 1, 'generationName': 'testGeneration'}]);
    });

    it('should throw error if options is not set or not an associative array', async function() {

    });

    it('should throw Error if options.familyId is not set', async function() {
      let catched = false;

      try {
        await pj.Generation.create({'generationName': 'testGeneration2'});
      } catch(err) {
        catched = true;
        err.message.should.equal('options.familyId is not set');
      }
      catched.should.be.true();
    });

    it('should throw Error if options.generationName is not set', async function() {
      let catched = false;

      try {
        await pj.Generation.create({'familyId': 1});
      } catch(err) {
        catched = true;
        err.message.should.equal('options.generationName is not set');
      }
      catched.should.be.true();
    });

    it('should throw Error if familyId does not reference an entry in families', async function() {
      let catched = false;
      try {
        await pj.Generation.create({'familyId': 1337, 'generationName': 'testGeneration3'});
      } catch(err) {
        catched = true;
        err.message.should.equal('options.familyId does not reference an existing Family');
      }
      catched.should.be.true();
      let result = await sqlite.all('SELECT familyId, generationId, generationName FROM generations WHERE generationName = "testGeneration3"');
      result.should.deepEqual([]);
    });

    after(async function() {
      await pj.disconnect();
    });
  });

  describe('#create() (with options.parents)', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testName'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
    });

    it('should also add parents if options.parents is specified', async function() {
      let generation = await pj.Generation.create({'familyId': 1, 'generationName': 'testWithParents', 'generationParents': [1,2]});
      generation.should.deepEqual({
        'generations': {
          '2': {
            'generationId': 2,
            'generationName': 'testWithParents',
            'generationParents': [1,2],
            'familyId': 1
          }
        }
      });
      let rows = await sqlite.all('SELECT * FROM generation_parents');
      rows.should.deepEqual(
        [
          {'parentId': 1, 'generationId': 2, 'plantId': 1},
          {'parentId': 2, 'generationId': 2, 'plantId': 2}
        ]
      );
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
      await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
      await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]})
    });

    it('should get generations and referenced families', async function() {
      let generations = await pj.Generation.get();
      generations.should.deepEqual({
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
            'generationName': 'S2',
            'generationParents': [1,2],
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
      });
    });

    it('should not have an familie property if familyName is not in options.fields', async function() {
      let generations = await pj.Generation.get(
        {
          'fields': ['familyId', 'generationName', 'generationParents']
        }
      );

      generations.should.deepEqual({
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
            'generationName': 'S2',
            'generationParents': [1,2],
            'familyId': 2
          }
        }
      });
    });

    it('should skip x generations specified with options.offset and limit the count of results to option.limit', async function() {
      let generations = await pj.Generation.get({'limit':2, 'offset': 1});

      generations.should.deepEqual({
        'generations': {
          '2': {
            'generationId': 2,
            'generationName': 'F2',
            'generationParents': [],
            'familyId': 1,
          },
          '3': {
            'generationId': 3,
            'generationName': 'S1',
            'generationParents': [],
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
      });
    });

    it('should only return generations where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly', async function() {
      let generations = await pj.Generation.get({
        'where': {
          'familyId': 1
        }
      });

      generations.should.deepEqual({
        'families': {
          '1': {
            'familyId': 1,
            'familyName': 'testFamily1'
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
          }
        }
      })
    });

    it('should only return generations where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly', async function() {
      let generations = await pj.Generation.get({
        'where': {
          'familyName': 'testFamily1'
        }
      });

      generations.should.deepEqual({
        'families': {
          '1': {
            'familyId': 1,
            'familyName': 'testFamily1'
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
          }
        }
      });
    });

    it('should only return generations where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]', async function() {
      let generations = await pj.Generation.get({'fields': ['generationParents', 'generationName'], 'where': {'generationParents': [1,2]}});
      generations.should.deepEqual({
        'generations': {
          '4': {
            'generationId': 4,
            'generationName': 'S2',
            'generationParents': [1, 2],
            'familyId': 2
          }
        }
      });
    });

    after(async function() {
      await pj.disconnect();
    });
  });
});
