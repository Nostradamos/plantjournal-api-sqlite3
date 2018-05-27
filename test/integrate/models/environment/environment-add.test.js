/* eslint-env node, mocha */
'use strict';

require('should');

const plantJournal = require('../../../../src/plant-journal');

describe(`Environment()`, () => {
  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
    });

    afterEach(async () => {
      pj.disconnect();
    });

    it(`should throw error if options.environmentName is not set`, async () => {
      await pj.Environment.add({environmentDescription: 'blubb'})
        .should.be.rejectedWith('options.environmentName has to be set');
    });

    it(`should throw error if options.environmentName is not a string`, async () => {
      await pj.Environment.add({environmentName: 1})
        .should.be.rejectedWith('options.environmentName has to be a string');
    });

    it(`should create a new environement record and return the environment object`, async () => {
      let environment = await pj.Environment.add(
        {
          environmentName: 'Greenhouse #1',
          environmentDescription: 'Greenhouse in my garden.'
        }
      );

      let [createdAt, modifiedAt] = [
        environment.environments[1].environmentAddedAt,
        environment.environments[1].environmentModifiedAt
      ];

      environment.should.deepEqual({
        environments: {
          1: {
            environmentId: 1,
            environmentName: 'Greenhouse #1',
            environmentDescription: 'Greenhouse in my garden.',
            environmentMediums: [],
            environmentAddedAt: createdAt,
            environmentModifiedAt: modifiedAt,
          }
        }
      });

      let rowsEnvironments = await pj.knex.raw(
        `SELECT * FROM environments`
      );

      environment.environments[1].should
        .containDeep(rowsEnvironments[0]);
    });
  });
});
