/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Journal()`, () => {
  describe(`#delete()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();

      await pj.Environment.create({
        environmentName: 'Greenhouse #1',
        environmentDescription: 'This is the first greenhouse in my garden.'});
      await pj.Medium.create({mediumName: 'Pot #1', environmentId: 1});
      await pj.Medium.create({mediumName: 'Pot #2', environmentId: 1});
      await pj.Genotype.create({});
      await pj.Plant.create({plantName: 'testPlant1', genotypeId: 1});

      await pj.Journal.create({
        journalDatetime: 1337,
        journalType: 'log',
        journalValue: 'This is a log',
        plantId: 1});
      await pj.Journal.create({
        journalDatetime: 1337,
        journalType: 'ph-sensor',
        journalValue: 6.5,
        mediumId: 1});
      await pj.Journal.create({
        journalDatetime: 1337,
        journalType: 'ec-sensor',
        journalValue: 1.3,
        mediumId: 1});
      await pj.Journal.create({
        journalDatetime: 1337,
        journalType: 'temp-sensor',
        journalValue: 28.7,
        environmentId: 1});
      await pj.Journal.create({
        journalDatetime: 1555,
        journalType: 'log',
        journalValue: 'This is a log',
        plantId: 1});
      await pj.Journal.create({
        journalDatetime: 1555,
        journalType: 'watering',
        journalValue: '{"amount": 1.5, "n": 3, "p": 4, "k": 1.7, "fertilizers": ["Hakaphos Grün", "Hakaphos Blau"]}', // eslint-disable-line max-len
        mediumId: 1});
      await pj.Journal.create({
        journalDatetime: 1337,
        journalType: 'ph-sensor',
        journalValue: 6.8,
        mediumId: 2});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should delete journal with matching id`, async () => {
      let deleted = await pj.Journal.delete(
        {where: {journalId: 1}});
      deleted.journals.should.deepEqual([1]);

      let rowsPlant = await sqlite.all(
        'SELECT journalId FROM ' + CONSTANTS.TABLE_JOURNAL);

      rowsPlant.should.not.containDeep({journalId: 1});
    });

    it(`should delete all journals with journalType=log`, async () => {
      let deleted = await pj.Journal.delete(
        {where: {journalType: 'ph-sensor'}});

      deleted.journals.should.deepEqual([2, 7]);

      let rowsPlant = await sqlite.all(
        'SELECT journalId FROM ' + CONSTANTS.TABLE_JOURNAL);

      rowsPlant.should.not.containDeep([{journalId: 2}, {journalId: 7}]);

    });

    it(`should delete all journals where journalValue contains sensor`, async () => {
      let deleted = await pj.Journal.delete(
        {where: {journalType: {$like: '%sensor%'}}});

      deleted.journals.should.deepEqual([3, 4]);
    });

    it(`should not delete anything if no journals match`, async () => {
      let deleted = await pj.Journal.delete(
        {where: {journalType: {$like: '_sensor_'}}});

      deleted.journals.should.deepEqual([]);
    });
  });
});
