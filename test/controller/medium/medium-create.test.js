/* eslint-env node, mocha */
'use strict';

require('should');
const plantJournal = require('../../../src/pj');
const sqlite = require('sqlite');

describe('Generation()', function() {
    describe('#create()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Environment.create({environmentName: 'testEnvironment1'});
        });

        it('should throw error if options.mediumName is not set', async function() {
            await pj.Medium.create({'environmentId': 1})
                .should.be.rejectedWith('options.mediumName has to be set');
        });

        it('should throw error if options.mediumName is not a string', async function() {
            await pj.Medium.create({'environmentId': 1, 'mediumName': null})
                .should.be.rejectedWith('options.mediumName has to be a string');
        });

        it('should throw error if options.mediumDescription is set but not a string', async function() {
            await pj.Medium.create({'environmentId': 1, 'mediumName': 'testMedium1', 'mediumDescription': 123})
                .should.be.rejectedWith('options.mediumDescription has to be a string');
        });

        it('should throw error if options.environmentId is not set', async function() {
            await pj.Medium.create({'mediumName': 'testMedium1', 'mediumDescription': '123'})
                .should.be.rejectedWith('options.environmentId has to be set');

        });

        it('should throw error if options.environmentId is not an int', async function() {
            await pj.Medium.create({'environmentId': null, 'mediumName': 'testMedium1', 'mediumDescription': '123'})
                .should.be.rejectedWith('options.environmentId has to be an integer');
        });

        it('should throw error if options.environmentId doesn\'t reference existing environment', async function() {
            await pj.Medium.create({'environmentId': 3, 'mediumName': 'testMedium1', 'mediumDescription': '123'})
                .should.be.rejectedWith('options.environmentId does not reference an existing environment');
        });
    });
});
