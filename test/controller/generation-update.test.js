'use strict';

const should = require('should');
const sqlite = require('sqlite');
const _ = require('lodash');


const plantJournal = require('../../src/pj');
const CONSTANTS = require('../../src/constants');

describe('Family()', function() {
  describe('#update()', function() {
    let pj;

    before(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({'familyName': 'testFamily1'}); //familyId: 1
      await pj.Generation.create({'generationName': 'F1', 'familyId': 1});
      await pj.Generation.create({'generationName': 'F2', 'familyId': 1});
      await pj.Family.create({'familyName': 'testFamily2'});  //familyId: 2
      await pj.Generation.create({'generationName': 'S1', 'familyId': 2});
      await pj.Generation.create({'generationName': 'S2', 'familyId': 2});
    });

    it('should throw error if no arguments got passed', async function() {
      await pj.Generation.update()
        .should.be.rejectedWith('No Update and Critera Object got passed');
    });

    it('should throw error if no criteria object got passed', async function() {
      await pj.Generation.update({})
        .should.be.rejectedWith('No Criteria Object got passed');
    });

    it('should throw error if first argument is not a assoc array/object', async function() {
      await pj.Generation.update([], {})
        .should.be.rejectedWith('Update Object has to be an associative array');
    });

    it('should throw error if second argument is not an assoc array/object', async function() {
      await pj.Generation.update({'generationName': 'newGenName'}, null)
        .should.be.rejectedWith('Criteria Object has to be an associative array');
    });

    it('should update generation in database and return an array containing the updated generationId', async function() {
      let updatedGen = await pj.Generation
        .update({'generationName': 'F1Updated'}, {'where': {'generationId': 1}});

      updatedGen.should.eql([1]);

      // Make sure family rows are untouched
      let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILIES);
      rowsFam.should.deepEqual(
        [
          {'familyId': 1, 'familyName': 'testFamily1'},
          {'familyId': 2, 'familyName': 'testFamily2'}
        ]
      );

      let rowsGen = await sqlite.all('SELECT generationId, generationName FROM ' + CONSTANTS.TABLE_GENERATIONS);
      rowsGen.should.deepEqual(
        [
          {'generationId': 1, 'generationName': 'F1Updated'},
          {'generationId': 2, 'generationName': 'F2'},
          {'generationId': 3, 'generationName': 'S1'},
          {'generationId': 4, 'generationName': 'S2'},

        ]
      );
    });

    it('should also be possible to find multiple generations to update based on family fields', async function() {
      let updatedGen = await pj.Generation
        .update({'generationName': 'NoGoodGenName'}, {'where': {'familyId': 2}});

      updatedGen.should.eql([3,4]);
    });

    it('should also be possible to limit/offset generations to update when found multiple', async function() {
      let updatedGen = await pj.Generation
        .update({'generationName': 'NoGoodGenName'}, {'where': {'familyId': 1}, 'offset': 1});

      updatedGen.should.eql([2]);

    });
  });
});