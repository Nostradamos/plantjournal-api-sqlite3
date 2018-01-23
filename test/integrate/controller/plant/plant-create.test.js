/* eslint-env node, mocha */
'use strict';


require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Plant()`, () => {
  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Genotype.create(
        {generationId: 1, genotypeName: 'testGenotype1'});
      await pj.Environment.create({environmentName: 'Greenhouse #1'});
      await pj.Medium.create({mediumName: 'Medium #1', environmentId: 1});
    });

    afterEach(async () => {
      pj.disconnect();
    });

    it(`should throw error if options is not set or not an associative array`, async () => {
      let tested = 0;
      let toTest = [
        [1,2],
        null,
        'string',
        1,
        true,
        undefined
      ];
      for (let value in toTest) {
        await pj.Family.create(value).should.be.rejectedWith(
          'First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it(`should throw error if options.generationId is not an integer`, async () => {
      await pj.Plant
        .create({plantName: 'testPlant', generationId: 'test'})
        .should.be.rejectedWith('options.generationId has to be an integer');
    });

    it(`should throw error if options.genotypeId is not an integer`, async () => {
      await pj.Plant.create({plantName: 'testPlant', genotypeId: null})
        .should.be.rejectedWith('options.genotypeId has to be an integer');
    });

    it(`should throw error if options.generationId does not reference an existing generationId`, async () => {
      await pj.Plant.create({generationId: 42, plantName: 'test'})
        .should.be.rejectedWith(
          'options.generationId does not reference an existing Generation');
    });

    it(`should throw error if options.plantName is not set`, async () => {
      await pj.Plant.create({genotypeId: 2})
        .should.be.rejectedWith('options.plantName has to be set');
    });

    it(`should throw error if options.plantName is not a string`, async () => {
      await pj.Plant.create({genotypeId: 2, plantName: 1})
        .should.be.rejectedWith('options.plantName has to be a string');
    });

    it(`should throw error if options.plantSex is not a valid sex`, async () => {
      await pj.Plant
        .create({genotypeId: 2, plantName: 'test', plantSex: 'notavalidsex'})
        .should.be.rejectedWith(
          'options.plantSex has to be null, male, female or hermaphrodite');
    });

    it(`should throw error if options.genotypeId does not reference an existing genotypeId`, async () => {
      await pj.Plant.create({genotypeId: 2, plantName: 'test'})
        .should.be.rejectedWith(
          'options.genotypeId does not reference an existing Genotype');
    });

    it(`should throw error if options.plantClonedFrom does not reference an existing plant`, async () => {
      await pj.Plant.create({plantName: 'clonePlant2', plantClonedFrom: 12})
        .should.be.rejectedWith(
          'options.plantClonedFrom does not reference an existing Plant');

    });

    it(`should throw error if options.plantClonedFrom is not an integer`, async () => {
      await pj.Plant.create(
        {plantName: 'clonePlant2', plantClonedFrom: 'not an integer'})
        .should.be.rejectedWith('options.plantClonedFrom has to be an integer');
    });

    it(`should only create a new plant entry if options.genotypeId is set and return plant object with plant attributes + genotypeId`, async () => {
      let plant = await pj.Plant.create(
        {
          genotypeId: 1,
          plantName: 'testPlant1',
          plantDescription:
            'we found this plant in the backyard of our grandma',
          mediumId: 1
        }
      );
      let [createdAt, modifiedAt] = [
        plant.plants[1].plantCreatedAt,
        plant.plants[1].plantModifiedAt
      ];

      plant.should.deepEqual({
        plants: {
          1: {
            plantId: 1,
            plantName: 'testPlant1',
            plantClonedFrom: null,
            plantClones: [],
            plantSex: null,
            plantDescription:
              'we found this plant in the backyard of our grandma',
            plantCreatedAt: createdAt,
            plantModifiedAt: modifiedAt,
            genotypeId: 1,
            mediumId: 1
          }
        }
      });

      let rowsPlants = await sqlite.all(`SELECT * FROM plants`);
      plant.plants[1].should.containDeep(rowsPlants[0]);

      let rowsGenotypes = await sqlite.all(`SELECT * FROM genotypes`);
      rowsGenotypes[0].should.containDeep(
        {
          genotypeId: 1,
          genotypeName: 'testGenotype1',
          generationId: 1
        }
      );
    });

    it(`should create a new plant and genotype entry if options.genotypeId is not set and return plant object + genotype object`, async () => {
      let plant = await pj.Plant.create(
        {
          generationId: 1,
          genotypeName: 'testGeno2',
          genotypeDescription: 'foobar',
          plantName: 'testPlant1'
        }
      );

      let [createdAtPlant, modifiedAtPlant] = [
        plant.plants[1].plantCreatedAt, plant.plants[1].plantModifiedAt
      ];
      let [createdAtGenotype, modifiedAtGenotype] = [
        plant.genotypes[2].genotypeCreatedAt,
        plant.genotypes[2].genotypeModifiedAt
      ];

      plant.should.deepEqual({
        genotypes: {
          2: {
            genotypeId: 2,
            genotypeName: 'testGeno2',
            genotypeDescription: 'foobar',
            genotypePlants: [1],
            generationId: 1,
            genotypeCreatedAt: createdAtGenotype,
            genotypeModifiedAt: modifiedAtGenotype
          }
        },
        plants: {
          1: {
            plantId: 1,
            plantName: 'testPlant1',
            plantClonedFrom: null,
            plantClones: [],
            plantSex: null,
            plantDescription: '',
            plantCreatedAt: createdAtPlant,
            plantModifiedAt: modifiedAtPlant,
            genotypeId: 2,
            mediumId: null
          }
        }
      });
    });

    it(`should only create a new plant entry if options.plantClonedFrom is set, and not options.genotypeId is not set but resolve the genotypeId from the mother plant`, async () => {
      await pj.Plant.create({genotypeId: 1, plantName: 'motherPlant1'});
      let plantClone = await pj.Plant.create(
        {plantName: 'clonePlant2', plantClonedFrom: 1});
      let [createdAtClone, modifiedAtClone] = [
        plantClone.plants[2].plantCreatedAt,
        plantClone.plants[2].plantModifiedAt
      ];

      createdAtClone.should.eql(modifiedAtClone);
      plantClone.should.deepEqual({
        plants: {
          2: {
            plantId: 2,
            plantName: 'clonePlant2',
            plantClonedFrom: 1,
            plantClones: [],
            plantSex: null,
            plantDescription: '',
            plantCreatedAt: createdAtClone,
            plantModifiedAt: modifiedAtClone,
            genotypeId: 1,
            mediumId: null
          }
        }
      });
      let rowsPlants = await sqlite.all(`SELECT * FROM plants`);
      plantClone.plants[2].should.containDeep(rowsPlants[1]);

      let rowsGenotypes = await sqlite.all(`SELECT * FROM genotypes`);
      rowsGenotypes.should.containDeep(
        [{genotypeId: 1, genotypeName: 'testGenotype1', generationId: 1}]);
    });

    it(`should be possible to create a plant without setting genotypeName or genotypeId`, async () => {
      let plant = await pj.Plant.create({plantName: 'motherPlant1'});

      plant.should.containDeep(
        {
          genotypes: {
            2: {
              genotypeId: 2,
              genotypeName: '',
              genotypeDescription: '',
              generationId: null
            }
          },
          plants: {
            1: {
              plantId: 1,
              plantName: 'motherPlant1',
              plantClonedFrom: null,
              plantSex: null,
              plantDescription: '',
              genotypeId: 2,
              mediumId: null,
            }
          }
        }
      );
    });
  });
});
