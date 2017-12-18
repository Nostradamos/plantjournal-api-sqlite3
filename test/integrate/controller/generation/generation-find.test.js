/* eslint-env node, mocha */
'use strict';

const should = require('should');

const plantJournal = require('../../../../src/pj');

const UtilsTest = require('../../../utils-test');

describe(`Generation()`, () => {
  describe(`#find()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Family.create({familyName: 'testFamily2'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Generation.create({familyId: 1, generationName: 'F2'});
      await pj.Generation.create({familyId: 2, generationName: 'S1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
      await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
      await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find and return generations and related families`, async () => {
      let generations = await pj.Generation.find();

      generations.should.containDeep({
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
      UtilsTest
        .allGenerationsShouldHaveCreatedAtAndModifiedAt(generations);
      UtilsTest
        .allFamiliesShouldHaveCreatedAtAndModifiedAt(generations);

    });

    it(`should not have an family property if familyName is not in options.attributes`, async () => {
      let generations = await pj.Generation.find(
        {
          'attributes': ['familyId',
            'generationName',
            'generationParents']
        }
      );

      should(generations.families).be.undefined();

    });

    it(`should skip x generations specified with options.offset and limit the count of results to option.limit`, async () => {
      let generations = await pj.Generation
        .find(
          {
            'limit': 2,
            'offset': 1
          }
        );

      generations.should.containDeep({
        'found': 4,
        'remaining': 1,
        'generations': {
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

    it(`should only return generations where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly`, async () => {
      let generations = await pj.Generation.find({
        'where': {
          'familyId': 1
        }
      });

      generations.should.containDeep({
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
      });
    });

    it(`should only return generations where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly`, async () => {
      let generations = await pj.Generation.find({
        'where': {
          'familyName': 'testFamily1'
        }
      });

      generations.should.containDeep({
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

    it(`should only return generations where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]`, async () => {
      let generations = await pj.Generation.find({'attributes': ['generationParents', 'generationName'], 'where': {'generationParents': [1,2]}});

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

    it(`should only find generations where generation has only the one generationParent if options.where.generationParents = plantIdA`, async () => {

    });
  });

  describe(`#find() (more tests for generationParents)`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Family.create({familyName: 'testFamily2'});

      await pj.Plant.create({plantName: 'testPlant1'});
      await pj.Plant.create({plantName: 'testPlant2'});
      await pj.Plant.create({plantName: 'testPlant3'});
      await pj.Plant.create({plantName: 'testPlant4'});

      await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]});
      await pj.Generation.create({familyId: 2, generationName: 'GenerationWithOnlyOneParent1', generationParents: [1]});
      await pj.Generation.create({familyId: 2, generationName: 'GenerationWithOnlyOneParent2', generationParents: [2]});
      await pj.Generation.create({familyId: 2, generationName: 'S2 (open pollination)', generationParents: [1,2,3,4]});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should only find generations with one parent if we do an equals operation where operator value is an integer'`, async () => {
      let generations = await pj.Generation.find(
        {where: {generationParents: {$eq: 2}}});
      generations.generations.should.containDeep(
        {
          3: {
            generationName: 'GenerationWithOnlyOneParent2',
            generationParents: [2]
          }
        }
      );
    });

    it(`should only find generations with one parent if we do an equals operation where operator value is an integer'`, async () => {
      let generations = await pj.Generation.find(
        {where: {generationParents: {$eq: 2}}});
      generations.generations.should.containDeep(
        {
          3: {
            generationName: 'GenerationWithOnlyOneParent2',
            generationParents: [2]
          }
        }
      );
    });

    it(`should find with $neq all generations which don't have a specific set of parents but every other combination including them`, async () => {
      let generations = await pj.Generation.find(
        {attributes: ['generationName', 'generationParents'], where: {generationParents: {$neq: [1,2]}}});
      generations.generations.should.containDeep(
        {
          2: {
            generationName: 'GenerationWithOnlyOneParent1',
            generationParents: [1]
          },
          3: {
            generationName: 'GenerationWithOnlyOneParent2',
            generationParents: [2]
          },
          4: {
            generationName: 'S2 (open pollination)',
            generationParents: [1,2,3,4]
          }
        }
      );
      generations.found.should.equal(3);
    });

    it(`should find all generations which have at least some parents with the $has operator`, async () => {
      let generations = await pj.Generation.find(
        {attributes: ['generationName', 'generationParents'], where: {generationParents: {$has: 2}}});
      generations.generations.should.containDeep(
        {
          1: {
            generationName: 'S2',
            generationParents: [1,2]
          },
          3: {
            generationName: 'GenerationWithOnlyOneParent2',
            generationParents: [2]
          },
          4: {
            generationName: 'S2 (open pollination)',
            generationParents: [1,2,3,4]
          }
        }
      );
      generations.found.should.equal(3);

    });

    it(`should find generations which don't have a specif parent with $nhas operator`, async () => {
      let generations = await pj.Generation.find(
        {attributes: ['generationName', 'generationParents'], where: {generationParents: {$nhas: 2}}});
      generations.generations.should.containDeep(
        {
          2: {
            generationName: 'GenerationWithOnlyOneParent1',
            generationParents: [1]
          }
        }
      );
      generations.found.should.equal(1);
    });
  });

  describe(`generationGenotypes attribute`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'Family1'});
      await pj.Generation.create({generationName: 'Gen1', familyId: 1});
      await pj.Genotype.create({generationId: 1});
      await pj.Genotype.create({generationId: 1});
      await pj.Generation.create({generationName: 'Gen2', familyId: 1});
      await pj.Genotype.create({generationId: 2});
      await pj.Family.create({familyName: 'Family2'});
      await pj.Generation.create({generationName: 'Gen3', familyId: 2});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find all generations and the generationGenotypes attribute should contain an array of genotypeIds related to the generation.`, async () => {
      let generations = await pj.Generation.find();
      generations.should.containDeep(
        {
          found: 3,
          remaining: 0,
          generations: {
            1: {
              generationName: 'Gen1',
              generationGenotypes: [1, 2]
            },
            2: {
              generationName: 'Gen2',
              generationGenotypes: [3]
            },
            3: {
              generationName: 'Gen3',
              generationGenotypes: []
            }
          },
          families: {
            1: {
              familyName: 'Family1',
              familyGenerations: [1, 2]
            },
            2: {
              familyName: 'Family2',
              familyGenerations: [3]
            }
          }
        }
      );
    });
  });
});
