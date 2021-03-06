/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Plant()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();

      //familyId: 1
      await pj.Family.add({familyName: 'testFamily1'});
      //generationId: 1
      await pj.Generation.add({generationName: 'F1', familyId: 1});
      //generationId: 2
      await pj.Generation.add({generationName: 'F2', familyId: 1});
      //familyId: 2
      await pj.Family.add({familyName: 'testFamily2'});
      //generationId: 3
      await pj.Generation.add({generationName: 'S1', familyId: 2});
      //generationId: 4
      await pj.Generation.add({generationName: 'S2', familyId: 2});
      //genotypeId: 1
      await pj.Genotype.add({genotypeName: 'F1Geno1', generationId: 1});
      //genotypeId: 2
      await pj.Genotype.add({genotypeName: 'F1Geno2', generationId: 1});
      //genotypeId: 3
      await pj.Genotype.add({genotypeName: 'F2Geno1', generationId: 2});
      //genotypeId: 4
      await pj.Genotype.add({genotypeName: 'S1Geno1', generationId: 3});
      //genotypeId: 5
      await pj.Genotype.add({genotypeName: 'S2Geno1', generationId: 4});
      //plantId: 1
      await pj.Plant.add({plantName: 'F1Geno1Plant1', genotypeId: 1});
      //plantId: 2
      await pj.Plant.add({plantName: 'F1Geno2Plant2', genotypeId: 2});
      //plantId: 3
      await pj.Plant.add({
        plantName: 'F1Geno2Plant2Clone1',
        genotypeId: 2,
        plantClonedFrom: 2});
      //plantId: 4
      await pj.Plant.add({plantName: 'F2Geno1Plant1', genotypeId: 3});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no arguments got passed`, async () => {
      await pj.Plant.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Plant.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Plant.update([], {})
        .should.be.rejectedWith('Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Plant.update({plantName: 'newPlantName'}, null)
        .should.be.rejectedWith(
          'Criteria Object has to be an associative array');
    });

    it(`should update plant in database and return an array containing the updated generationId`, async () => {
      let updatedGen = await pj.Plant.update(
        {plantName: 'F1Geno1Plant1Updated'}, {where: {plantId: 1}});

      updatedGen.should.eql([1]);

      // Make sure family rows are untouched
      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_NAME_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}`);

      rowsFam.should.deepEqual(
        [
          {familyId: 1, familyName: 'testFamily1'},
          {familyId: 2, familyName: 'testFamily2'}
        ]
      );

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

      rowsGeno.should.deepEqual(
        [
          {genotypeId: 1, genotypeName: 'F1Geno1'},
          {genotypeId: 2, genotypeName: 'F1Geno2'},
          {genotypeId: 3, genotypeName: 'F2Geno1'},
          {genotypeId: 4, genotypeName: 'S1Geno1'},
          {genotypeId: 5, genotypeName: 'S2Geno1'}
        ]
      );

      let rowsPlant = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_PLANT}, ${CONSTANTS.ATTR_NAME_PLANT}
        FROM ${CONSTANTS.TABLE_PLANT}`);

      rowsPlant.should.deepEqual(
        [
          {plantId: 1, plantName: 'F1Geno1Plant1Updated'},
          {plantId: 2, plantName: 'F1Geno2Plant2'},
          {plantId: 3, plantName: 'F1Geno2Plant2Clone1'},
          {plantId: 4, plantName: 'F2Geno1Plant1'}
        ]
      );
    });

    it(`should also be possible to find multiple plant to update based on family attributes`, async () => {
      let updatedPlant = await pj.Plant
        .update({plantName: 'NoGoodPlantName'}, {where: {familyId: 1}});

      updatedPlant.should.eql([1,
        2,
        3,
        4]);
    });

    it(`should also be possible to find multiple plants to update based on generation attributes`, async () => {
      let updatedPlant = await pj.Plant.update(
        {plantName: 'NoGoodPlantName'}, {where: {generationId: 1}});

      updatedPlant.should.eql([1,
        2,
        3]);
    });

    it(`should also be possible to limit/offset plant to update when found multiple`, async () => {
      let updatedPlant = await pj.Plant.update(
        {plantName: 'NoGoodPlantName'},
        {where: {familyId: 1}, offset: 2, limit: 2});

      updatedPlant.should.eql([3,4]);
    });

    it(`should not be possible to manually change plantModifiedAt`, async () => {
      let updatedPlant = await pj.Plant.update(
        {plantModifiedAt: 1},
        {where: {plantId: 1}}
      );

      updatedPlant.length.should.eql(0);

      let rowsPlant = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_PLANT}, ${CONSTANTS.ATTR_MODIFIED_AT_PLANT}
        FROM ${CONSTANTS.TABLE_PLANT}
        WHERE ${CONSTANTS.ATTR_ID_PLANT} = 1`);

      rowsPlant[0].plantModifiedAt.should.not.eql(1);
    });

    it(`should not be possible to manually change plantAddedAt`, async () => {
      let updatedPlant = await pj.Plant.update(
        {plantAddedAt: 1},
        {where: {plantId: 1}}
      );

      updatedPlant.length.should.eql(0);

      let rowsPlant = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_PLANT}, ${CONSTANTS.ATTR_ADDED_AT_PLANT}
        FROM ${CONSTANTS.TABLE_PLANT}
        WHERE ${CONSTANTS.ATTR_ID_PLANT} = 1`);

      rowsPlant[0].plantAddedAt.should.not.eql(1);
    });

    it(`should be possible to update genotypeId`, async () => {
      let updatedPlant = await pj.Plant.update(
        {genotypeId: 3},
        {where: {plantId: 1}}
      );

      updatedPlant.should.eql([1]);

      let rowsPlant = await sqlite.all(`
        SELECT  ${CONSTANTS.ATTR_ID_PLANT}, ${CONSTANTS.ATTR_ID_GENOTYPE}
        FROM ${CONSTANTS.TABLE_PLANT}
        WHERE ${CONSTANTS.ATTR_ID_PLANT} = 1`);

      rowsPlant[0].genotypeId.should.eql(3);
    });

    it(`should throw error if genotypeId to update does not reference existing genotype`, async () => {
      await pj.Plant.update(
        {genotypeId: 43},
        {where: {plantId: 1}}
      ).should.be.rejectedWith('update.genotypeId or update.plantClonedFrom does not reference an existing genotype/plant');

    });

    it(`should be possible to update plantClonedFrom`, async () => {
      let updatedPlant = await pj.Plant.update(
        {plantClonedFrom: 4},
        {where: {plantId: 2}}
      );

      updatedPlant.should.eql([2]);

      let rowsPlant = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_PLANT},  ${CONSTANTS.ATTR_CLONED_FROM_PLANT}
        FROM ${CONSTANTS.TABLE_PLANT}
        WHERE ${CONSTANTS.ATTR_ID_PLANT} = 2`);

      rowsPlant[0].plantClonedFrom.should.eql(4);
    });

    it(`should throw error if plantClonedFrom does not reference existing plant`, async () => {
      await pj.Plant.update(
        {plantClonedFrom: 1337},
        {where: {plantId: 2}}
      ).should.be.rejectedWith('update.genotypeId or update.plantClonedFrom does not reference an existing genotype/plant');
    });
  });
});
