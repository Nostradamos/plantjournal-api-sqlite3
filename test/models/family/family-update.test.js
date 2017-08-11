/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const CONSTANTS = require('../../../src/constants');
const plantJournal = require('../../../src/pj');
const Utils = require('../../../src/utils');


describe('Family()', function() {
    describe('#update()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({'familyName': 'testFamily1'});
            await pj.Family.create({'familyName': 'testFmily2'});
            await pj.Family.create({'familyName': 'testFmily3'});

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
            let updatedFamilies = await pj.Family.update({'familyName': 'testFamily2'}, {'filter': {'familyId': 2}});

            updatedFamilies.should.deepEqual([2]);

            let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILIES);

            rowsFam.should.deepEqual(
                [
                    {'familyId': 1, 'familyName': 'testFamily1'},
                    {'familyId': 2, 'familyName': 'testFamily2'},
                    {'familyId': 3, 'familyName': 'testFmily3'},

                ]
            );
        });

        it('should update modifiedAt Field in database', async function() {
            let currentTimestamp = Utils.getUnixTimestampUTC();

            await pj.Family.update({'familyName': 'testFamily2'}, {'filter': {'familyId': 2}});

            let rowsFam = await sqlite.all('SELECT familyId, familyModifiedAt FROM ' + CONSTANTS.TABLE_FAMILIES  + ' WHERE familyId = 2');

            (rowsFam[0].familyModifiedAt >= currentTimestamp).should.be.true();

        });

        it('should not be possible to manually change familyModifiedAt', async function() {
            let updatedFamilies = await pj.Family.update(
                {'familyModifiedAt': 1},
                {'filter': {'familyId': 2}}
            );

            updatedFamilies.length.should.eql(0);

            let rowsFam = await sqlite.all('SELECT familyId, familyModifiedAt FROM ' + CONSTANTS.TABLE_FAMILIES  + ' WHERE familyId = 2');

            rowsFam[0].familyModifiedAt.should.not.eql(1);
        });

        it('should not be possible to manually change familyCreatedAt', async function() {
            let updatedFamilies = await pj.Family.update(
                {'familyCreatedAt': 1},
                {'filter': {'familyId': 2}}
            );

            updatedFamilies.length.should.eql(0);

            let rowsFam = await sqlite.all('SELECT familyId, familyCreatedAt FROM ' + CONSTANTS.TABLE_FAMILIES  + ' WHERE familyId = 2');

            rowsFam[0].familyCreatedAt.should.not.eql(1);
        });


        it('should ignore unknown update keys and not throw an error', async function() {
            await pj.Family.update({'familyName': 'testFamily2', 'unknownField': 'blubb'}, {'filter': {'familyId': 2}});
        });

        it('should be possible to update records with criteria.sort and criteria.limit', async function() {
            let updatedFamilies = await pj.Family.update(
                {'familyName': 'testFooBar'},
                {'sort': 'familyId DESC', 'limit': 2}
            );

            updatedFamilies.should.eql([3,2]);
        });
    });
});
