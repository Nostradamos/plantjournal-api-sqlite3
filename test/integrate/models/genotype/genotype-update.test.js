/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Genotype()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      //familyId: 1
      await pj.Family.create({familyName: 'testFamily1'});
      //generationId: 1
      await pj.Generation.create({generationName: 'F1', familyId: 1});
      //generationId: 2
      await pj.Generation.create({generationName: 'F2', familyId: 1});
      //familyId: 2
      await pj.Family.create({familyName: 'testFamily2'});
      //generationId: 3
      await pj.Generation.create({generationName: 'S1', familyId: 2});
      //generationId: 4
      await pj.Generation.create({generationName: 'S2', familyId: 2});
      //genotypeId: 1
      await pj.Genotype.create({genotypeName: 'F1Geno1', generationId: 1});
      //genotypeId: 2
      await pj.Genotype.create({genotypeName: 'F1Geno2', generationId: 1});
      //genotypeId: 3
      await pj.Genotype.create({genotypeName: 'F2Geno1', generationId: 2});
      //genotypeId: 4
      await pj.Genotype.create({genotypeName: 'S1Geno1', generationId: 3});
      //genotypeId: 5
      await pj.Genotype.create({genotypeName: 'S2Geno1', generationId: 4});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no arguments got passed`, async () => {
      await pj.Genotype.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Genotype.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Genotype.update([], {})
        .should.be.rejectedWith(
          'Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Genotype.update({generationName: 'newGenName'}, null)
        .should.be.rejectedWith(
          'Criteria Object has to be an associative array');
    });

    it(`should update generation in database and return an array containing the updated generationId`, async () => {
      let updatedGen = await pj.Genotype
        .update({genotypeName: 'F1Geno1Updated'}, {where: {genotypeId: 1}});

      updatedGen.should.eql([1]);

      // Make sure family rows are untouched
      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_NAME_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}`);

      rowsFam.should.deepEqual([
        {familyId: 1, familyName: 'testFamily1'},
        {familyId: 2, familyName: 'testFamily2'}]);

      let rowsGen = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENERATION},
          ${CONSTANTS.ATTR_NAME_GENERATION}
        FROM ${CONSTANTS.TABLE_GENERATION}`);

      rowsGen.should.deepEqual(
        [
          {generationId: 1, generationName: 'F1'},
          {generationId: 2, generationName: 'F2'},
          {generationId: 3, generationName: 'S1'},
          {generationId: 4, generationName: 'S2'}

        ]
      );

      let rowsGeno = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENOTYPE}, ${CONSTANTS.ATTR_NAME_GENOTYPE}
        FROM ${CONSTANTS.TABLE_GENOTYPE}`);

      rowsGeno.should.deepEqual([
        {genotypeId: 1, genotypeName: 'F1Geno1Updated'},
        {genotypeId: 2, genotypeName: 'F1Geno2'},
        {genotypeId: 3, genotypeName: 'F2Geno1'},
        {genotypeId: 4, genotypeName: 'S1Geno1'},
        {genotypeId: 5, genotypeName: 'S2Geno1'}]);
    });

    it(`should also be possible to find multiple genotypes to update based on family attributes`, async () => {
      let updatedGeno = await pj.Genotype
        .update({genotypeName: 'NoGoodGenoName'}, {where: {familyId: 2}});

      updatedGeno.should.eql([4,5]);
    });

    it(`should also be possible to find multiple genotypes to update based on generation attributes`, async () => {
      let updatedGeno = await pj.Genotype
        .update({genotypeName: 'NoGoodGenoName'}, {where: {generationId: 1}});

      updatedGeno.should.eql([1,2]);
    });

    it(`should also be possible to limit/offset genotypes to update when found multiple`, async () => {
      let updatedGeno = await pj.Genotype.update(
        {genotypeName: 'NoGoodGenoName'},
        {where: {familyId: 1}, offset: 1, limit: 2});

      updatedGeno.should.eql([2, 3]);
    });

    it(`should not be possible to manually change genotypeModifiedAt`, async () => {
      let updatedGeno = await pj.Generation.update(
        {generationModifiedAt: 1},
        {where: {genotypeId: 1}}
      );

      updatedGeno.length.should.eql(0);

      let rowsGeno = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENOTYPE},
          ${CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE}
        FROM ${CONSTANTS.TABLE_GENOTYPE}
        WHERE ${CONSTANTS.ATTR_ID_GENOTYPE} = 1`);

      rowsGeno[0].genotypeModifiedAt.should.not.eql(1);
    });

    it(`should not be possible to manually change genotypeCreatedAt`, async () => {
      let updatedGeno = await pj.Genotype.update(
        {genotypeCreatedAt: 1},
        {where: {genotypeId: 1}}
      );

      updatedGeno.length.should.eql(0);

      let rowsGeno = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENOTYPE},
          ${CONSTANTS.ATTR_CREATED_AT_GENOTYPE}
        FROM ${CONSTANTS.TABLE_GENOTYPE}
        WHERE ${CONSTANTS.ATTR_ID_GENOTYPE} = 1`);

      rowsGeno[0].genotypeCreatedAt.should.not.eql(1);
    });

    it(`should be possible to update generationId`, async () => {
      let updatedGeno = await pj.Genotype.update(
        {generationId: 2},
        {where: {genotypeId: 5}}
      );

      updatedGeno.should.eql([5]);

      let rowsGeno = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENOTYPE}, ${CONSTANTS.ATTR_ID_GENERATION}
        FROM ${CONSTANTS.TABLE_GENOTYPE}
        WHERE ${CONSTANTS.ATTR_ID_GENOTYPE} = 5`);

      rowsGeno[0].generationId.should.eql(2);
    });

    it(`should throw error if generationId does not reference existing generation`, async () => {
      await pj.Genotype.update(
        {generationId: 42},
        {where: {genotypeId: 5}}
      ).should.be.rejectedWith(
        'update.generationId does not reference an existing Generation');
    });
  });
});
