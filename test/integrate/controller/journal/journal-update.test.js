/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Journal()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();

      await pj.Environment.create({environmentName: 'Greenhouse #1'});

      await pj.Journal.create({journalTimestamp: 1337, journalType: 'temp-sensor', journalValue: 6.5, environmentId: 1});
      await pj.Journal.create({journalTimestamp: 1337, journalType: 'rlf-sensor', journalValue: 80, environmentId: 1});
      await pj.Journal.create({journalTimestamp: 1437, journalType: 'rlf-sensor', journalValue: 78, environmentId: 1});

    });

    after(async () => {
      await pj.disconnect();
    });


    it(`should throw error if no arguments got passed`, async () => {
      await pj.Journal.update()
        .should.be
        .rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Journal.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Journal.update([], {})
        .should.be.rejectedWith(
          'Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Journal.update({environmentName: 'newEnvName'}, null)
        .should.be.rejectedWith(
          'Criteria Object has to be an associative array');
    });

    it(`should update journal in database and return updated journal id`, async () => {
      let updated = await pj.Journal.update(
        {journalValue: 90},
        {where: {journalId: 2}});

      updated.should.deepEqual([2]);

      let rows = await sqlite.all(
        `SELECT journalType, journalValue, journalTimestamp FROM journals
                WHERE journalId = 2`);

      rows[0].should.deepEqual(
        {journalType: 'rlf-sensor', journalValue: 90, journalTimestamp: 1337});
    });

    it(`should update multiple journals and return all updated journalIds`, async() => {
      let updated = await pj.Journal.update(
        {journalValue: 90},
        {where: {journalType: {$like: '%sensor%'}}});

      updated.should.deepEqual([1, 2, 3]);

      let rows = await sqlite.all(
        `SELECT journalId, journalType, journalValue, journalTimestamp FROM journals`);

      rows.should.deepEqual(
        [
          {journalId: 1, journalType: 'temp-sensor', journalValue: 90, journalTimestamp: 1337},
          {journalId: 2, journalType: 'rlf-sensor', journalValue: 90, journalTimestamp: 1337},
          {journalId: 3, journalType: 'rlf-sensor', journalValue: 90, journalTimestamp: 1437},
        ]
      );
    });
  });
});
