/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Environment()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.create({'environmentName': 'testEnvronment1'});
      await pj.Environment.create({'environmentName': 'testEnvronment2'});
      await pj.Environment.create({'environmentName': 'testEnvronment3'});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no arguments got passed`, async () => {
      await pj.Environment.update()
        .should.be
        .rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Environment.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`,
      async () => {
        await pj.Environment.update([], {})
          .should.be.rejectedWith(
            'Update Object has to be an associative array');
      }
    );

    it(`should throw error if second argument is not an assoc array/object`,
      async () => {
        await pj.Environment.update({'environmentName': 'newEnvName'}, null)
          .should.be.rejectedWith(
            'Criteria Object has to be an associative array');
      }
    );

    it(`should update environment in database and return updated environment id`, async () => {
      let updated = await pj.Environment.update(
        {'environmentName': 'testEnvironment2'},
        {where: {environmentId: 2}});
      updated.should.deepEqual([2]);

      let rows = await sqlite.all(
        `SELECT environmentId, environmentName FROM environments
                WHERE environmentId = 2`);
      rows[0].should.deepEqual({
        environmentId: 2, environmentName: 'testEnvironment2'});
    });

    it(`should not update an environment if no one where found`, async () => {
      let updated = await pj.Environment.update(
        {'environmentName': 'NonFoo'},
        {where: {environmentName: 'foobar'}});
      updated.should.deepEqual([]);
    });
  });
});
