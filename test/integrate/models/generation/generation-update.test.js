/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Generation()`, () => {
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
      //plantId: 1
      await pj.Plant.add({plantName: 'testPlant1', generationId: 1});
      //plantId: 2
      await pj.Plant.add({plantName: 'testPlant2', generationId: 2});
      //generationId: 4
      await pj.Generation.add(
        {generationName: 'S2', familyId: 2, generationParents: [1,2]});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no arguments got passed`, async () => {
      await pj.Generation.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Generation.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Generation.update([], {})
        .should.be.rejectedWith('Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Generation.update({generationName: 'newGenName'}, null)
        .should.be.rejectedWith('Criteria Object has to be an associative array');
    });

    it(`should update generation in database and return an array containing the updated generationId`, async () => {
      let updatedGen = await pj.Generation
        .update({generationName: 'F1Updated'}, {where: {generationId: 1}});

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
          {generationId: 1, generationName: 'F1Updated'},
          {generationId: 2, generationName: 'F2'},
          {generationId: 3, generationName: 'S1'},
          {generationId: 4, generationName: 'S2'}

        ]
      );
    });

    it(`should also be possible to find multiple generations to update based on family attributes`, async () => {
      let updatedGen = await pj.Generation
        .update({generationName: 'NoGoodGenName'}, {where: {familyId: 2}});

      updatedGen.should.eql([3,4]);
    });

    it(`should also be possible to limit/offset generations to update when found multiple`, async () => {
      let updatedGen = await pj.Generation.update(
        {generationName: 'NoGoodGenName'}, {where: {familyId: 1}, offset: 1});
      updatedGen.should.eql([2]);
    });

    it(`should not be possible to manually change generationModifiedAt`, async () => {
      let updatedGenerations = await pj.Generation.update(
        {generationModifiedAt: 1},
        {where: {generationId: 1}}
      );

      updatedGenerations.length.should.eql(0);

      let rowsGen = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENERATION},
          ${CONSTANTS.ATTR_MODIFIED_AT_GENERATION}
        FROM ${CONSTANTS.TABLE_GENERATION}
        WHERE ${CONSTANTS.ATTR_ID_GENERATION} = 1`);

      rowsGen[0].generationModifiedAt.should.not.eql(1);
    });

    it(`should not be possible to manually change generationAddedAt`, async () => {
      let updatedGenerations = await pj.Generation.update(
        {generationAddedAt: 1},
        {where: {generationId: 1}}
      );

      updatedGenerations.length.should.eql(0);

      let rowsGen = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENERATION},
          ${CONSTANTS.ATTR_ADDED_AT_GENERATION}
        FROM ${CONSTANTS.TABLE_GENERATION}
        WHERE ${CONSTANTS.ATTR_ID_GENERATION} = 1`);

      rowsGen[0].generationAddedAt.should.not.eql(1);
    });

    it(`should throw error if familyId to update is invalid`, async () => {
      await pj.Generation.update(
        {familyId: 42},
        {where: {generationId: 1}}
      ).should.be.rejectedWith(
        'update.familyId does not reference an existing Family');
    });

    it(`should update familyId if not invalid`, async () => {
      let updatedGenerations = await pj.Generation.update(
        {familyId: 2},
        {where: {generationId: 1}}
      );

      updatedGenerations.should.eql([1]);

      let rowsGen = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENERATION}, ${CONSTANTS.ATTR_ID_FAMILY}
        FROM ${CONSTANTS.TABLE_GENERATION}
        WHERE ${CONSTANTS.ATTR_ID_GENERATION} = 1`);

      rowsGen[0].familyId.should.eql(2);

    });

    it(`should be possible to update generationParents`, async () => {
      let updatedGenerations = await pj.Generation.update(
        {generationParents: [1, 2]},
        {where: {generationId: 2}}
      );

      updatedGenerations.should.eql([2]);

      let rowsParents = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENERATION}, ${CONSTANTS.ATTR_ID_PLANT}
        FROM ${CONSTANTS.TABLE_GENERATION_PARENT}
        WHERE ${CONSTANTS.ATTR_ID_GENERATION} = 2`);

      rowsParents.should.eql([
        {generationId: 2, plantId: 1},
        {generationId: 2, plantId: 2}]);
    });

    it(`should throw error and rollback if generationParents are invalid`, async () => {
      await pj.Generation.update(
        {generationParents: [5,6]},
        {where: {generationId: 4}}
      ).should.be.rejectedWith('update.generationParents does not reference to existing Plants. At least one reference is invalid.');

      let rowsParents = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENERATION}, ${CONSTANTS.ATTR_ID_PLANT}
        FROM ${CONSTANTS.TABLE_GENERATION_PARENT}
        WHERE ${CONSTANTS.ATTR_ID_GENERATION} = 4`);

      rowsParents.should.eql([
        {generationId: 4, plantId: 1},
        {generationId: 4, plantId: 2}]);
    });
  });
});
