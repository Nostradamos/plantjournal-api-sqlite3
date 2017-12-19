/* eslint-env node, mocha */
'use strict';

require('should');
const plantJournal = require('../../../../src/pj');
const sqlite = require('sqlite');

describe(`Medium()`, () => {
  describe(`#create()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.create({environmentName: 'testEnvironment1'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if options.mediumName is not set`, async () => {
      await pj.Medium.create({environmentId: 1})
        .should.be.rejectedWith('options.mediumName has to be set');
    });

    it(`should throw error if options.mediumName is not a string`, async () => {
      await pj.Medium.create({environmentId: 1, mediumName: null})
        .should.be.rejectedWith('options.mediumName has to be a string');
    });

    it(`should throw error if options.mediumDescription is set but not a string`, async () => {
      await pj.Medium.create(
        {environmentId: 1, mediumName: 'testMedium1', mediumDescription: 123})
        .should.be.rejectedWith('options.mediumDescription has to be a string');
    });

    it(`should throw error if options.environmentId is not an int`, async () => {
      await pj.Medium.create({
        environmentId: '123',
        mediumName: 'testMedium1',
        mediumDescription: '123'})
        .should.be.rejectedWith(
          'options.environmentId has to be an integer or null');
    });

    it(`should throw error if options.environmentId doesn't reference existing environment`, async () => {
      await pj.Medium.create(
        {environmentId: 3, mediumName: 'testMedium1', mediumDescription: '123'})
        .should.be.rejectedWith(
          'options.environmentId does not reference an existing environment');
    });

    it(`should create a new generations entry and return generation object`, async () => {
      let medium = await pj.Medium.create({
        environmentId: 1,
        mediumName: 'testMedium',
        mediumDescription: 'This is a test'});

      let [createdAt, modifiedAt] = [
        medium.mediums[1].mediumCreatedAt,
        medium.mediums[1].mediumModifiedAt];

      createdAt.should.eql(modifiedAt);

      medium.should.deepEqual({
        mediums: {
          1: {
            mediumId: 1,
            mediumDescription: 'This is a test',
            mediumName: 'testMedium',
            mediumPlants: [],
            environmentId: 1,
            mediumCreatedAt: createdAt,
            mediumModifiedAt: modifiedAt
          }
        }
      });

      let rows = await sqlite.all(`SELECT * FROM mediums`);
      medium.mediums[1].should.containDeep(rows[0]);
    });
  });
});
