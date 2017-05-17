const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');
const _ = require('lodash');

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
      let [createdAt, modifiedAt] = [generation.generations[1].generationCreatedAt, generation.generations[1].generationModifiedAt];
      createdAt.should.eql(modifiedAt);
      generation.should.deepEqual({
        generations: {
          '1': {
            'generationId': 1,
            'generationName': 'testGeneration',
            'generationParents': [],
            'familyId': 1,
            'generationCreatedAt': createdAt,
            'generationModifiedAt': modifiedAt
          }
        }
      });

      let result = await sqlite.all('SELECT familyId, generationId, generationName, generationCreatedAt, generationModifiedAt FROM generations');
      result.should.deepEqual(
        [
          {
            'familyId': 1,
            'generationId': 1,
            'generationName': 'testGeneration',
            'generationCreatedAt': createdAt,
            'generationModifiedAt': modifiedAt
          }
        ]
      );
    });

    it('should throw error if options is not set or not an associative array', async function() {
      let tested = 0;
      for(value in [[1,2], null, 'string', 1, true, undefined]) {
        await pj.Generation.create(value)
          .should.be.rejectedWith('First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it('should throw Error if options.familyId is not set', async function() {
      await pj.Generation.create({'generationName': 'testGeneration2'})
        .should.be.rejectedWith('options.familyId has to be set');
    });

    it('should throw error if options.familyId is not an integer', async function() {
      await pj.Generation.create({'generationName': 'testGeneration2', 'familyId': '1'})
        .should.be.rejectedWith('options.familyId has to be an integer');
    });

    it('should throw error if options.generationName is not set', async function() {
      await pj.Generation.create({'familyId': 1})
        .should.be.rejectedWith('options.generationName has to be set');
    });

    it('should throw error if options.generationName is not a string', async function() {
      await pj.Generation.create({'familyId': 1, 'generationName': 1})
        .should.be.rejectedWith('options.generationName has to be a string');
    });

    it('should throw error if generationParents is set but not an array', async function() {
      await pj.Generation.create({'familyId': 1, 'generationName': 'test', 'generationParents': {}})
        .should.be.rejectedWith('options.generationParents has to be an array of integers');
    });

    it('should throw Error if familyId does not reference an entry in families', async function() {
      await pj.Generation.create({'familyId': 1337, 'generationName': 'testGeneration3'})
        .should.be.rejectedWith('options.familyId does not reference an existing Family');
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
      let [createdAt, modifiedAt] = [generation.generations[2].generationCreatedAt, generation.generations[2].generationModifiedAt];
      generation.should.deepEqual({
        'generations': {
          '2': {
            'generationId': 2,
            'generationName': 'testWithParents',
            'generationParents': [1,2],
            'generationCreatedAt': createdAt,
            'generationModifiedAt': modifiedAt,
            'familyId': 1,
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
      await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
      await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]})
    });

    it('should find generations and referenced families', async function() {
      let generations = await pj.Generation.find();
      generations.should.deepEqual({
        'found': 4,
        'remaining': 0,
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
      let generations = await pj.Generation.find(
        {
          'fields': ['familyId', 'generationName', 'generationParents']
        }
      );

      generations.should.deepEqual({
        'found': 4,
        'remaining': 0,
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
      let generations = await pj.Generation.find({'limit':2, 'offset': 1});

      generations.should.deepEqual({
        'found': 4,
        'remaining': 1,
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
      let generations = await pj.Generation.find({
        'where': {
          'familyId': 1
        }
      });

      generations.should.deepEqual({
        'found': 2,
        'remaining': 0,
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
        },
        'families': {
          '1': {
            'familyId': 1,
            'familyName': 'testFamily1'
          }
        }
      })
    });

    it('should only return generations where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly', async function() {
      let generations = await pj.Generation.find({
        'where': {
          'familyName': 'testFamily1'
        }
      });

      generations.should.deepEqual({
        'found': 2,
        'remaining': 0,
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
      let generations = await pj.Generation.find({'fields': ['generationParents', 'generationName'], 'where': {'generationParents': [1,2]}});
      generations.should.deepEqual({
        'found': 1,
        'remaining': 0,
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
