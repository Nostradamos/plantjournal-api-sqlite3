'use strict';

/* eslint-env node, mocha */
let should = require('should');

const plantJournal = require('../../../../src/pj');
const UtilsTest = require('../../../utils-test');

describe(`Plant()`, () => {
  describe(`#find()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'}); // familyId: 1
      await pj.Family.create({familyName: 'testFamily2'}); // familyId: 2
      await pj.Generation.create({familyId: 1, generationName: 'F1'}); // generationId: 1
      await pj.Generation.create({familyId: 1, generationName: 'F2'}); // generationId: 2
      await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'}); // genotypeId: 1
      await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'}); // genotypeId: 2
      await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'}); // plantId: 1
      await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2', plantSex: 'male'}); // plantId: 2

      await pj.Generation.create({familyId: 2, generationName: 'S1', generationParents: [1,2]}); // generationId: 3
      await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'}); // genotypeId: 3
      await pj.Plant.create({genotypeId: 3, plantName: 'testPlant3', plantSex: 'male'}); // plantId: 3
      await pj.Plant.create({plantName: 'testPlant4', plantClonedFrom: 3, plantSex: 'female'}); // plantId: 4

      await pj.Generation.create({familyId: 2, generationName: 'S1 #2', generationParents: [1,3]}); // generationId: 4
      await pj.Plant.create({generationId: 4, plantName: 'testPlant5'}); // plantId: 5 genotypeId: 4
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find plants, referenced genotypes, generations and families`, async () => {
      let plants = await pj.Plant.find();

      plants.should.containDeep(
        {
          'found': 5,
          'remaining': 0,
          'plants': {
            '1': {
              'plantId': 1,
              'plantName': 'testPlant1',
              'plantClonedFrom': null,
              'plantClones': [],
              'plantSex': null,
              'genotypeId': 1,
              'mediumId': null,
              'generationId': 1,
              'familyId': 1
            },
            '2': {
              'plantId': 2,
              'plantName': 'testPlant2',
              'plantClonedFrom': null,
              'plantClones': [],
              'plantSex': 'male',
              'genotypeId': 2,
              'mediumId': null,
              'generationId': 2,
              'familyId': 1
            },
            '3': {
              'plantId': 3,
              'plantName': 'testPlant3',
              'plantClonedFrom': null,
              'plantClones': [4],
              'plantSex': 'male',
              'genotypeId': 3,
              'mediumId': null,
              'generationId': 3,
              'familyId': 2
            },
            '4': {
              'plantId': 4,
              'plantName': 'testPlant4',
              'plantClonedFrom': 3,
              'plantSex': 'female',
              'genotypeId': 3,
              'mediumId': null,
              'generationId': 3,
              'familyId': 2
            },
            '5': {
              'plantId': 5,
              'plantName': 'testPlant5',
              'plantClonedFrom': null,
              'plantClones': [],
              'plantSex': null,
              'genotypeId': 4,
              'mediumId': null,
              'generationId': 4,
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
            },
            '4': {
              'generationId': 4,
              'generationName': 'S1 #2',
              'generationParents': [1, 3],
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

      UtilsTest
        .allPlantsShouldHaveCreatedAtAndModifiedAt(plants);
      UtilsTest
        .allGenotypesShouldHaveCreatedAtAndModifiedAt(plants);
      UtilsTest
        .allGenerationsShouldHaveCreatedAtAndModifiedAt(plants);
      UtilsTest
        .allFamiliesShouldHaveCreatedAtAndModifiedAt(plants);
    });

    it(`should not have an empty families property object if familyName is NOT in options.attributes`, async () => {
      let plants = await pj.Plant.find(
        {
          'attributes': ['familyId',
            'generationName',
            'genotypeName']
        }
      );

      should(plants.families).be.undefined();
    });

    it(`should not have an empty generations property object if generationName is NOT in options.attributes`, async () => {
      let plants = await pj.Plant.find(
        {
          'attributes': ['familyId', 'genotypeName']
        }
      );

      should(plants.generations).be.undefined();
    });

    it(`should not have an empty genotypes object if phenotypeName is NOT in options.attributes`, async () => {
      let plants = await pj.Plant.find(
        {
          'attributes': ['familyId']
        }
      );

      should(plants.phenotypes).be.undefined();
    });

    it(`should skip the first 3 plants if options.offset = 3 and limit plants to 1 if options.limit=1`, async () => {
      let plants = await pj.Plant.find({'offset': 2, 'limit': 1, 'attributes': ['plantName']});

      plants.should.containDeep({
        'found': 5,
        'remaining': 2,
        'plants': {
          '3': { 'plantId': 3, 'plantName': 'testPlant3', 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
        }
      });
    });

    it(`should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for plant attributes)`, async () => {
      let plants = await pj.Plant.find({'where': {'plantName': 'testPlant3'}, 'attributes': ['plantId']});

      plants.should.containDeep({
        'found': 1,
        'remaining': 0,
        'plants': {
          '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
        }

      });
    });

    it(`should only return plants where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype attributes)`, async () => {
      let plants = await pj.Plant.find({'where': {'genotypeName': 'testGenotype3'}, 'attributes': ['plantId']});

      plants.should.containDeep({
        'found': 2,
        'remaining': 0,
        'plants': {
          '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2},
          '4': {'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
        }
      });
    });

    it(`should only return plants where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]`, async () => {
      let plants = await pj.Plant.find({'where': {'generationParents': [1,2]}, 'attributes': ['plantId',
        'plantName',
        'generationParents',
        'generationName']});

      plants.should.containDeep({
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
      });
    });

    it(`should be possible to find plants where parents are [1,2] OR [1,3]`, async () => {
      let plants = await pj.Plant.find(
        {
          'where':
                        {'generationParents': [1,2],
                          '$or': {'generationParents': [1,3]}
                        },
          'attributes': [
            'plantName',
            'generationParents',
            'generationName',
          ]
        }
      );

      plants.should.containDeep({
        'found': 3,
        'remaining': 0,
        'plants': {
          '3': {
            'plantId': 3,
            'plantName': 'testPlant3',
            'genotypeId': 3,
            'generationId': 3,
            'familyId': 2,
          },
          '4': {
            'plantId': 4,
            'plantName': 'testPlant4',
            'genotypeId': 3,
            'generationId': 3,
            'familyId': 2
          },
          '5': {
            'plantId': 5,
            'plantName': 'testPlant5',
            'genotypeId': 4,
            'generationId': 4,
            'familyId': 2
          }
        },
        'generations': {
          '3': {
            'generationId': 3,
            'generationName': 'S1',
            'generationParents': [1, 2],
            'familyId': 2
          },
          '4': {
            'generationId': 4,
            'generationName': 'S1 #2',
            'generationParents': [1, 3],
            'familyId': 2
          }
        }
      });
    });

    it(`should get related medium/environment information if plant.mediumId is not null`, async () => {
      await pj.Environment.create({environmentName: 'Greenhouse #1'});
      await pj.Medium.create({mediumName: 'TestMedium #1', environmentId: 1});
      await pj.Plant.create({generationId: 4, plantName: 'testPlant6', mediumId: 1});

      let plant = await pj.Plant.find({where: {plantId: 6}});
      plant.should.containDeep(
        {
          found: 1,
          remaining: 0,
          plants: {
            6: {
              genotypeId: 5,
              generationId: 4,
              familyId: 2,
              mediumId: 1,
              environmentId: 1,
              plantName: 'testPlant6',
              plantClonedFrom: null,
              plantSex: null,
              plantDescription: '',
              plantId: 6,
            }
          },
          genotypes: {
            5: {
              generationId: 4,
              familyId: 2,
              genotypeName: '',
              genotypeDescription: '',
              genotypeId: 5,
            }
          },
          generations: {
            4: {
              familyId: 2,
              generationName: 'S1 #2',
              generationParents: [1, 3],
              generationDescription: '',
              generationId: 4,
            }
          },
          families: {
            2: {
              familyName: 'testFamily2',
              familyDescription: '',
              familyId: 2,
            }
          },
          mediums: {
            1: {
              environmentId: 1,
              mediumName: 'TestMedium #1',
              mediumDescription: '',
              mediumId: 1,
            }
          },
          environments: {
            1: {
              environmentName: 'Greenhouse #1',
              environmentDescription: '',
              environmentId: 1
            }
          }
        }
      );

    });

  });
});
