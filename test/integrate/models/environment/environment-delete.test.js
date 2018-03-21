/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Environment()`, () => {
  describe(`#delete()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();

      await pj.Environment.create({environmentName: 'environment1'});
      await pj.Environment.create({environmentName: 'environment2'});
      await pj.Medium.create({mediumName: 'medium1', environmentId: 1});
      await pj.Medium.create({mediumName: 'medium2', environmentId: 1});
      await pj.Medium.create({mediumName: 'medium3'});

      // familyId:1
      await pj.Family.create(
        {familyName: 'family1'});
      // generationId: 1
      await pj.Generation.create(
        {generationName : 'generation1', familyId: 1});
      // plantId: 1 genotypeId: 1
      await pj.Plant.create(
        {generationId: 1, plantName: 'plant1', mediumId: 1});
      // plantId: 1 genotypeId: 1
      await pj.Plant.create(
        {generationId: 1, plantName: 'plant2', mediumId: null});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should delete environment with matching id and related mediums and plants`, async () => {
      let deleted = await pj.Environment.delete(
        {where: {environmentId: 1}});
      deleted.should.deepEqual({
        environments: [1],
        mediums: [1, 2],
        plants: [1]
      });

      // Make sure we deleted also from database
      let rowsEnv = await sqlite.all(
        'SELECT environmentId FROM ' + CONSTANTS.TABLE_ENVIRONMENT);
      rowsEnv.should.deepEqual([{environmentId: 2}]);

      let rowsMed = await sqlite.all(
        'SELECT mediumId FROM ' + CONSTANTS.TABLE_MEDIUM);
      rowsMed.should.deepEqual([{mediumId: 3}]);

      let rowsPlant = await sqlite.all(
        'SELECT plantId FROM ' + CONSTANTS.TABLE_PLANT);
      rowsPlant.should.deepEqual([{plantId: 2}]);

    });
  });
});
