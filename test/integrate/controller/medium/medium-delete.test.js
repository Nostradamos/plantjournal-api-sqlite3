/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Medium()`, () => {
  describe(`#delete()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();

      await pj.Medium.create({mediumName: 'medium1'});
      await pj.Medium.create({mediumName: 'medium2'});

      await pj.Family.create({familyName: 'family1'}); // familyId:1
      await pj.Generation.create({generationName : 'generation1', familyId: 1}); // generationId: 1
      await pj.Plant.create({generationId: 1, plantName: 'plant1', mediumId: 1}); // plantId: 1 genotypeId: 1
      await pj.Plant.create({generationId: 1, plantName: 'plant2', mediumId: 1}); // plantId: 2 genotypeId: 2
      await pj.Plant.create({generationId: 1, plantName: 'plant3', mediumId: 2}); // plantId: 3 genotypeId: 3
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should delete environment with matching id and related mediums and plants`, async () => {
      let deleted = await pj.Medium.delete({where: {mediumId: 1}});
      deleted.should.deepEqual({
        mediums: [1],
        plants: [1, 2]
      });

      // Make sure we deleted also from database
      let rowsMed = await sqlite.all(
        'SELECT mediumId FROM ' + CONSTANTS.TABLE_MEDIUM);
      rowsMed.should.deepEqual([{mediumId: 2}]);

      let rowsPlant = await sqlite.all(
        'SELECT plantId FROM ' + CONSTANTS.TABLE_PLANT);
      rowsPlant.should.deepEqual([{plantId: 3}]);

    });
  });
});
