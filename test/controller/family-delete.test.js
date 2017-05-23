'use strict';

const should = require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../src/pj');
const CONSTANTS = require('../../src/constants');

describe('Family()', function() {
  describe('#delete()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'test1'}); // id:1
      await pj.Family.create({familyName: 'testB'}); // id:2
      await pj.Family.create({familyName: 'test3'}); // id:3
      await pj.Family.create({familyName: 'testD'}); // id:4
    });

    it('should throw error if no criteria object got passed', async function() {
      await pj.Family.delete()
        .should.be.rejectedWith('No criteria object passed');
    });

    it('should delete specified family in criteria.where.familyId and return the id', async function() {
      let deletedFam = await pj.Family.delete(
        {
          'where': {
            'familyId': 1
          }
        }
      );

      deletedFam.should.deepEqual({
        'familyId': [1]
      });

      let rows = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILIES);
      rows.should.deepEqual(
        [
          {'familyId': 2, 'familyName': 'testB'},
          {'familyId': 3, 'familyName': 'test3'},
          {'familyId': 4, 'familyName': 'testD'}
        ]
      )
    });
  });


});
