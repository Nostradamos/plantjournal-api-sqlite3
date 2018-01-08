/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Genotype()`, () => {
  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
    });

    afterEach(async () => {
      await pj.disconnect();
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
        await pj.Genotype.create(value)
          .should.be.rejectedWith(
            'First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it(`should throw error if options.generationId is not an integer`, async () => {
      await pj.Genotype.create({generationId: '1'})
        .should.be.rejectedWith('options.generationId has to be an integer');
    });

    it(`should throw an error if options.generationId does not reference a generation`, async () => {
      await pj.Genotype.create({generationId: 1337})
        .should.be.rejectedWith(
          'options.generationId does not reference an existing Generation');
    });

    it(`should throw error if options.genotypeName is not a string`, async () => {
      await pj.Genotype.create({generationId: 1, genotypeName: 1})
        .should.be.rejectedWith(
          'options.genotypeName has to be a string');
    });

    it(`should create a new genotypes entry and return Genotypes Object`, async () => {
      let genotype = await pj.Genotype.create(
        {
          generationId: 1,
          genotypeName: 'testGenotype1',
          genotypeDescription: 'this is a very special genotype'
        }
      );

      let [createdAt, modifiedAt] = [
        genotype.genotypes[1].genotypeCreatedAt,
        genotype.genotypes[1].genotypeModifiedAt];

      genotype.genotypes[1].should.deepEqual({
        genotypeId: 1,
        genotypeName: 'testGenotype1',
        genotypeDescription: 'this is a very special genotype',
        genotypePlants: [],
        generationId: 1,
        genotypeCreatedAt: createdAt,
        genotypeModifiedAt: modifiedAt
      });

      let rows = await sqlite.all(`SELECT * FROM genotypes`);
      genotype.genotypes[1].should.containDeep(rows[0]);
    });

    it(`should be possible to create a new genotype with genotypeName not set`, async () => {
      let genotype = await pj.Genotype.create({generationId: 1});

      genotype.genotypes[1].should.containDeep({
        genotypeId: 1,
        genotypeName: '',
      });
    });

    it(`should be possible to create a new genotype without a generationId`, async () => {
      let genotype = await pj.Genotype.create(
        {genotypeName: 'genoTest42'});

      genotype.genotypes[1].should.containDeep({
        genotypeName: 'genoTest42',
        generationId: null,
      });

      let rows = await sqlite.all(`SELECT * FROM genotypes`);
      genotype.genotypes[1].should.containDeep(rows[0]);
    });

    it(`should not create a new genotype with a generation if generationId is null`, async () => {
      let genotype = await pj.Genotype.create(
        {genotypeName: 'genoTest42', generationId: null});

      genotype.genotypes[1].should.containDeep({
        genotypeName: 'genoTest42',
        generationId: null,
      });

      let rows = await sqlite.all(`SELECT * FROM generations`);
      rows.length.should.eql(1);
    });

    it(`should be possible to create a new genotype and generation at once`, async () => {
      let genotype = await pj.Genotype.create(
        {genotypeName: 'genoTest43', generationName: 'F2', familyId: 1});
      genotype.should.containDeep({
        genotypes: {
          1: {
            genotypeName: 'genoTest43',
            generationId: 2
          }
        },
        generations: {
          2: {
            generationName: 'F2',
            generationGenotypes: [1],
            familyId: 1
          }
        }
      });
    });

    it(`should be possible to create a new genotype, generation and family at once`, async () => {
      let genotype = await pj.Genotype.create({
        genotypeName: 'genoTest43',
        generationName: 'F2',
        familyName: 'TestFamily2'});

      genotype.should.containDeep({
        genotypes: {
          1: {
            genotypeName: 'genoTest43',
            generationId: 2
          }
        },
        generations: {
          2: {
            generationName: 'F2',
            generationGenotypes: [1],
            familyId: 2
          }
        },
        families: {
          2: {
            familyName: 'TestFamily2',
            familyGenerations: [2],
            familyId: 2
          }
        }
      });
    });
  });
});
