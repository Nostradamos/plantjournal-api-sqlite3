/* eslint-env node, mocha */
'use strict';

const should = require('should');

const plantJournal = require('../../../../src/pj');

const UtilsTest = require('../../../utils-test');

describe(`Medium()`, () => {
  describe(`#find()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.add({
        environmentName: 'testEnv1',
        environmentDescription: 'this is a test'});
      await pj.Medium.add({
        environmentId: 1, mediumName: 'testMed1',
        mediumDescription: 'medium test'});
      await pj.Medium.add({
        environmentId: 1, mediumName: 'testMed2',
        mediumDescription: 'another test'});
      await pj.Medium.add({
        environmentId: null, mediumName: 'testMed3'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find genotypes, referenced generations and families`, async () => {
      let mediums = await pj.Medium.find();

      mediums.should.containDeep(
        {
          found: 3,
          remaining: 0,
          mediums: {
            1: {
              mediumId: 1,
              mediumName: 'testMed1',
              mediumDescription: 'medium test',
              environmentId: 1,
            },
            2: {
              mediumId: 2,
              mediumName: 'testMed2',
              mediumDescription: 'another test',
              environmentId: 1,
            },
            3: {
              mediumId: 3,
              mediumName: 'testMed3',
              mediumDescription: '',
              environmentId: null
            }
          },
          environments: {
            1: {
              environmentId: 1,
              environmentName: 'testEnv1',
              environmentDescription: 'this is a test',
            },
          }
        }
      );

      UtilsTest
        .allMediumsShouldHaveAddedAtAndModifiedAt(mediums);
      UtilsTest
        .allEnvironmentsShouldHaveAddedAtAndModifiedAt(mediums);
    });

    it(`should skip first medium with criteria.offset = 1`, async () => {
      let mediums = await pj.Medium.find({offset: 1});

      mediums.should.containDeep(
        {
          found: 3,
          remaining: 0,
          mediums: {
            2: {
              mediumId: 2,
              mediumName: 'testMed2',
              mediumDescription: 'another test',
              environmentId: 1,
            },
            3: {
              mediumId: 3,
              mediumName: 'testMed3',
              mediumDescription: '',
              environmentId: null
            }
          }
        }
      );
    });

    it(`should be possible to find mediums based on environment attributes`, async () => {
      let mediums = await pj.Medium.find(
        {where: {environmentName: 'testEnv1'}});

      mediums.should.containDeep(
        {
          found: 2,
          remaining: 0,
          mediums: {
            1: {
              mediumId: 1,
              mediumName: 'testMed1',
              mediumDescription: 'medium test',
              environmentId: 1,
            },
            2: {
              mediumId: 2,
              mediumName: 'testMed2',
              mediumDescription: 'another test',
              environmentId: 1,
            },
          }
        }
      );
    });

    it(`should be possible to find mediums where environmentId = null and environments should not be set`, async () => {
      let mediums = await pj.Medium.find(
        {where: {environmentId: null}});

      mediums.should.containDeep(
        {
          found: 1,
          remaining: 0,
          mediums: {
            3: {
              mediumId: 3,
              mediumName: 'testMed3',
              mediumDescription: '',
              environmentId: null
            }
          }
        }
      );

      should(mediums.environments).be.undefined();
    });
  });

  describe(`mediumPlants attribute`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Medium.add({mediumName: 'med1'});
      await pj.Plant.add({plantName: 'plant1', mediumId: 1});
      await pj.Plant.add({plantName: 'plant2', mediumId: 1});
      await pj.Medium.add({mediumName: 'med2'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find all mediums and mediumPlants should contain all plants associated to that medium`, async () => {
      let mediums = await pj.Medium.find();
      mediums.should.containDeep(
        {
          mediums: {
            1: {
              mediumName: 'med1',
              mediumPlants: [1, 2]
            },
            2: {
              mediumName: 'med2',
              mediumPlants: []
            }
          }
        }
      );
    });
  });
});
