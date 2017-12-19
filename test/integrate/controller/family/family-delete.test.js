/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Family()`, () => {
  describe(`#delete()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      // familyId:1
      await pj.Family.create({familyName: 'test1'});
      // generationId: 1
      await pj.Generation.create({generationName : 'testGen1', familyId: 1});
      // plantId: 1 genotypeId: 1
      await pj.Plant.create({generationId: 1, plantName: 'blubb'});
      // plantId: 2 genotyeId: 2
      await pj.Plant.create({generationId: 1, plantName: 'blubb2'});

      // familyId:2
      await pj.Family.create({familyName: 'testB'});
      // generationId: 2
      await pj.Generation.create({generationName : 'testGen2', familyId: 2});
      // generationId: 3
      await pj.Generation.create({generationName : 'testGen3', familyId: 2});
      // plantId: 3 genotypeId: 3
      await pj.Plant.create({generationId: 2, plantName: 'blubb'});

      // familyId:3
      await pj.Family.create({familyName: 'test3'});
      // generationId: 4
      await pj.Generation.create({generationName : 'testGen4', familyId: 3});
      // genotypeId: 4
      await pj.Genotype.create({generationId: 4, genotypeName: 'testGeno1'});
      // genotypeId: 5
      await pj.Genotype.create({generationId: 4, genotypeName: 'testGeno2'});

      // familyId:4
      await pj.Family.create({familyName: 'testD'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Family.delete()
        .should.be.rejectedWith('No criteria object passed');
    });

    it(`should delete specified family in criteria.where.familyId and return the id`, async () => {
      let deletedFam = await pj.Family.delete({where: {familyId: 1}});

      deletedFam.should.deepEqual({
        families: [1],
        generations: [1],
        genotypes: [1, 2],
        plants: [1, 2]
      });

      // Make sure we deleted also from database

      let rowsFam = await sqlite.all(
        'SELECT familyId FROM ' + CONSTANTS.TABLE_FAMILY);

      rowsFam.should.deepEqual(
        [{familyId: 2}, {familyId: 3}, {familyId: 4}]);

      let rowsGen = await sqlite.all(
        'SELECT generationId FROM ' +  CONSTANTS.TABLE_GENERATION);

      rowsGen.should.deepEqual(
        [{generationId: 2}, {generationId: 3}, {generationId: 4}]);

      let rowsGeno = await sqlite.all(
        'SELECT genotypeId FROM ' + CONSTANTS.TABLE_GENOTYPE);

      rowsGeno.should.deepEqual(
        [{genotypeId: 3}, {genotypeId: 4}, {genotypeId: 5}]);

      let rowsPlant = await sqlite.all(
        'SELECT plantId FROM ' + CONSTANTS.TABLE_PLANT);

      rowsPlant.should.deepEqual([{plantId: 3}]);
    });

    it(`should be possibe to delete families with criteria.sort and criteria.limit instruction`, async () => {
      let deletedFam = await pj.Family.delete({
        limit: 2,
        sort: 'familyId DESC'
      });

      deletedFam.families.should.eql([4, 3]);
    });
  });
});
