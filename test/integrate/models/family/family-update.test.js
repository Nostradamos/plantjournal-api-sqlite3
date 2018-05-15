/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const CONSTANTS = require('../../../../src/constants');
const plantJournal = require('../../../../src/pj');
const Utils = require('../../../../src/utils/utils');


describe(`Family()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.add({familyName: 'testFamily1'});
      await pj.Family.add({familyName: 'testFmily2'});
      await pj.Family.add({familyName: 'testFmily3'});

    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no arguments got passed`, async () => {
      await pj.Family.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Family.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Family.update([], {})
        .should.be.rejectedWith('Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Family.update({familyName: 'newFamName'}, null)
        .should.be.rejectedWith(
          'Criteria Object has to be an associative array');
    });

    it(`should change familyName for testFmily2 in database and return the familyId`, async () => {
      let updatedFamilies = await pj.Family.update(
        {familyName: 'testFamily2'}, {where: {familyId: 2}});

      updatedFamilies.should.deepEqual([2]);

      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_NAME_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}`);

      rowsFam.should.deepEqual([
        {familyId: 1, familyName: 'testFamily1'},
        {familyId: 2, familyName: 'testFamily2'},
        {familyId: 3, familyName: 'testFmily3'},
      ]);
    });

    it(`should update modifiedAt Field in database`, async () => {
      let currentDatetime = Utils.getDatetimeUTC();

      await pj.Family.update(
        {familyName: 'testFamily2'}, {where: {familyId: 2}});

      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_MODIFIED_AT_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}
        WHERE ${CONSTANTS.ATTR_ID_FAMILY} = 2`);

      (rowsFam[0].familyModifiedAt >= currentDatetime).should.be.true();

    });

    it(`should not be possible to manually change familyModifiedAt`, async () => {
      let updatedFamilies = await pj.Family.update(
        {familyModifiedAt: 1},
        {where: {familyId: 2}});

      updatedFamilies.length.should.eql(0);

      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_MODIFIED_AT_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}
        WHERE ${CONSTANTS.ATTR_ID_FAMILY} = 2`);

      rowsFam[0].familyModifiedAt.should.not.eql(1);
    });

    it(`should not be possible to manually change familyAddedAt`, async () => {
      let updatedFamilies = await pj.Family.update(
        {familyAddedAt: 1},
        {where: {familyId: 2}}
      );

      updatedFamilies.length.should.eql(0);

      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_ADDED_AT_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}
        WHERE ${CONSTANTS.ATTR_ID_FAMILY} = 2`);

      rowsFam[0].familyAddedAt.should.not.eql(1);
    });


    it(`should ignore unknown update keys and not throw an error`, async () => {
      await pj.Family.update(
        {familyName: 'testFamily2', unknownField: 'blubb'},
        {where: {familyId: 2}});
    });

    it(`should be possible to update records with criteria.sort and criteria.limit`, async () => {
      let updatedFamilies = await pj.Family.update(
        {familyName: 'testFooBar'},
        {sort: 'familyId DESC', limit: 2});

      updatedFamilies.should.eql([3,2]);
    });
  });
});
