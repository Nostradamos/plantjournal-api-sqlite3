/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const CONSTANTS = require('../../../src/constants');
const plantJournal = require('../../../src/pj');
const Utils = require('../../../src/utils');


describe('Environment()', () => {
    describe('#update()', () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Environment.create({'environmentName': 'testEnvronment1'});
            await pj.Environment.create({'environmentName': 'testEnvronment2'});
            await pj.Environment.create({'environmentName': 'testEnvronment3'});
        });


        it('should throw error if no arguments got passed', async () => {
            await pj.Environment.update()
                .should.be.rejectedWith('No Update and Critera Object got passed');
        });

        it('should throw error if no criteria object got passed', async () => {
            await pj.Environment.update({})
                .should.be.rejectedWith('No Criteria Object got passed');
        });

        it('should throw error if first argument is not a assoc array/object', async () => {
            await pj.Environment.update([], {})
                .should.be.rejectedWith(
                    'Update Object has to be an associative array');
        });

        it('should throw error if second argument is not an assoc array/object', async () => {
            await pj.Environment.update({'familyName': 'newFamName'}, null)
                .should.be.rejectedWith(
                    'Criteria Object has to be an associative array');
        });

        it('should update environment in database and return updated environment id', async () => {
            let updated = await pj.Environment.update(
                {'environmentName': 'testEnvironment2'},
                {filter: {environmentId: 2}});
            updated.should.deepEqual([2]);
        });
    });
});
