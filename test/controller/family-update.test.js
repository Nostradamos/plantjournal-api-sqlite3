'use strict';

const should = require('should');
const sqlite = require('sqlite');
const _ = require('lodash');

const helpers = require('../helper-functions');

const plantJournal = require('../../src/pj');
const CONSTANTS = require('../../src/constants');

describe('Family()', function() {
  describe('#update()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({'familyName': 'testFamily1'});
      await pj.Family.create({'familyName': 'testFmily2'});
    });

    it('should throw error if no arguments got passed', async function() {
      await pj.Family.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it('should throw error if no criteria object got passed', async function() {
      await pj.Family.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it('should throw error if first argument is not a assoc array/object', async function() {
      await pj.Family.update([], {})
        .should.be.rejectedWith('Update Object has to be an associative array');
    });

    it('should throw error if second argument is not an assoc array/object', async function() {
      await pj.Family.update({'familyName': 'newFamName'}, null)
        .should.be.rejectedWith('Criteria Object has to be an associative array');
    });

    it('should change familyName for testFmily2 in database and return the familyId', async function() {
      let updatedFamilies = await pj.Family.update({'familyName': 'testFamily2'}, {'where': {'familyId': 2}});
      updatedFamilies.should.deepEqual([2]);

      let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILIES);
      rowsFam.should.deepEqual(
        [
          {'familyId': 1, 'familyName': 'testFamily1'},
          {'familyId': 2, 'familyName': 'testFamily2'}
        ]
      );
    });

    it('should ignore unknown update keys and not throw an error', async function() {
      await pj.Family.update({'familyName': 'testFamily2', 'unknownField': 'blubb'}, {'where': {'familyId': 2}});
    });
  });
});
