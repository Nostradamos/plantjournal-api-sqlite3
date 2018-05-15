/* eslint-env node, mocha */
'use strict';

const plantJournal = require('../../../../src/pj');
const UtilsTest = require('../../../utils-test');

require('should');

describe(`Environment()`, () => {
  describe(`#find()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.add({
        environmentName: 'Greenhouse #1',
        environmentDescription: 'This is the first greenhouse in my garden.'});
      await pj.Environment.add({
        environmentName: 'Greenhouse #2',
        environmentDescription: 'This is the second greenhouse in my garden.'});
      await pj.Environment.add({
        environmentName: 'Growbox #1',
        environmentDescription: 'Small growbox to keep mother plants all over the year.'});  // eslint-disable-line max-len
      await pj.Environment.add({
        environmentName: 'Allotment garden #1',
        environmentDescription: 'Allotment garden where i usually plant all food producing plants or test new varities.'});  // eslint-disable-line max-len
    });

    after(async () => {
      await pj.disconnect();
    });


    it(`should return all environments`, async () => {
      let environments = await pj.Environment.find();

      environments.should.containDeep({
        found: 4,
        remaining: 0,
        environments: {
          1: {
            environmentId: 1,
            environmentName: 'Greenhouse #1',
            environmentDescription: 'This is the first greenhouse in my garden.'
          },
          2: {
            environmentId: 2,
            environmentName: 'Greenhouse #2',
            environmentDescription: 'This is the second greenhouse in my garden.' // eslint-disable-line max-len
          },
          3: {
            environmentId: 3,
            environmentName: 'Growbox #1',
            environmentDescription: 'Small growbox to keep mother plants all over the year.' // eslint-disable-line max-len
          },
          4: {
            environmentId: 4,
            environmentName: 'Allotment garden #1',
            environmentDescription: 'Allotment garden where i usually plant all food producing plants or test new varities.' // eslint-disable-line max-len
          }
        }
      });

      UtilsTest
        .allEnvironmentsShouldHaveAddedAtAndModifiedAt(environments);
    });
  });

  describe(`environmentMediums attribute`, () => {
    let pj;
    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.add({environmentName: 'env1'});
      await pj.Medium.add({mediumName: 'med1', environmentId: 1});
      await pj.Medium.add({mediumName: 'med2', environmentId: 1});
      await pj.Environment.add({environmentName: 'env2'});
      await pj.Medium.add({mediumName: 'med3', environmentId: 2});
      await pj.Environment.add({environmentName: 'env3'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should find all environments and environmentMediums should contain all mediums related to that environment`, async () => {
      let environments = await pj.Environment.find();
      environments.should.containDeep({
        found: 3,
        remaining: 0,
        environments: {
          1: {
            environmentName: 'env1',
            environmentMediums: [1, 2]
          },
          2: {
            environmentName: 'env2',
            environmentMediums: [3]
          },
          3: {
            environmentName: 'env3',
            environmentMediums: []
          }
        }
      });
    });
  });
});
