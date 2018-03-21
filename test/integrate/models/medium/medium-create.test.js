/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Medium()`, () => {
  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.create({environmentName: 'testEnvironment1'});
    });

    afterEach(async () => {
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

    it(`should be possible to create a new medium without an environment`, async () => {
      let medium = await pj.Medium.create({
        mediumName: 'testMediumWithoutEnv',
        mediumDescription: 'This is a test'});

      medium.should.containDeep({
        mediums: {
          1: {
            mediumId: 1,
            mediumDescription: 'This is a test',
            mediumName: 'testMediumWithoutEnv',
            mediumPlants: [],
            environmentId: null,
          }
        }
      });

      let result = await sqlite.get(
        `SELECT count(*) FROM ${CONSTANTS.TABLE_ENVIRONMENT}`);
      result['count(*)'].should.eql(1);
    });

    it(`should be possible to create a new medium without an environment if environmentId is set to null`, async () => {
      let medium = await pj.Medium.create({
        mediumName: 'testMediumWithoutEnv',
        mediumDescription: 'This is a test',
        environmentId: null});

      medium.should.containDeep({
        mediums: {
          1: {
            mediumId: 1,
            mediumDescription: 'This is a test',
            mediumName: 'testMediumWithoutEnv',
            mediumPlants: [],
            environmentId: null,
          }
        }
      });

      let result = await sqlite.get(
        `SELECT count(*) FROM ${CONSTANTS.TABLE_ENVIRONMENT}`);
      result['count(*)'].should.eql(1);
    });


    it(`should be possible to create a new medium and environment in one create`, async () => {
      let medium = await pj.Medium.create({
        mediumName: 'testMedium',
        mediumDescription: 'This is a test234',
        environmentName: 'testEnvironment2',
        environmentDescription: 'test description for two'
      });

      medium.should.containDeep({
        mediums: {
          1: {
            mediumId: 1,
            mediumName: 'testMedium',
            mediumDescription: 'This is a test234',
            mediumPlants: [],
            environmentId: 2,
          }
        },
        environments: {
          2: {
            environmentId: 2,
            environmentName: 'testEnvironment2',
            environmentDescription: 'test description for two',
            environmentMediums: [1],
          }
        }
      });
    });
  });
});
