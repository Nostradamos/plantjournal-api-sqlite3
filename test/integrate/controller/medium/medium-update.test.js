/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Medium()`, () => {
  describe(`#update()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Medium.create({'mediumName': 'testMdium1'});
      await pj.Medium.create({'mediumName': 'testMdium2'});
    });

    after(async () => {
      await pj.disconnect();
    });


    it(`should throw error if no arguments got passed`, async () => {
      await pj.Medium.update()
        .should.be
        .rejectedWith('No Update and Critera Object got passed');
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Medium.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it(`should throw error if first argument is not a assoc array/object`, async () => {
      await pj.Medium.update([], {})
        .should.be.rejectedWith(
          'Update Object has to be an associative array');
    });

    it(`should throw error if second argument is not an assoc array/object`, async () => {
      await pj.Medium.update({'mediumName': 'newMediumName'}, null)
        .should.be.rejectedWith(
          'Criteria Object has to be an associative array');
    });

    it(`should update environment in database and return updated environment id`, async () => {
      let updated = await pj.Medium.update(
        {'mediumName': 'updatedMedium2'},
        {where: {mediumId: 2}});
      updated.should.deepEqual([2]);

      let rows = await sqlite.all(
        `SELECT mediumId, mediumName FROM mediums`);
      rows.should.deepEqual([
        {mediumId: 1, mediumName: 'testMdium1'},
        {mediumId: 2, mediumName: 'updatedMedium2'}
      ]);
    });
  });
});
