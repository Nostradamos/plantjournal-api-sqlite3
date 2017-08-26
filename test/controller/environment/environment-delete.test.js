/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../src/pj');
const CONSTANTS = require('../../../src/constants');

describe('Environment()', function() {
    describe('#delete()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            
            await pj.Environment.create({environmentName: 'environment1'});
            await pj.Medium.create({mediumName: 'medium1', environmentId: 1});
            await pj.Medium.create({mediumName: 'medium2', environmentId: 1});

            await pj.Family.create({familyName: 'family1'}); // familyId:1
            await pj.Generation.create({generationName : 'generation1', familyId: 1}); // generationId: 1
            await pj.Plant.create({generationId: 1, plantName: 'plant1', mediumId: 1}); // plantId: 1 genotypeId: 1
            await pj.Plant.create({generationId: 1, plantName: 'plant1', mediumId: 2}); // plantId: 1 genotypeId: 1
        });

        it('should delete environment with matching id and related medium and plant', async function() {
            let deleted = await pj.Environment.delete({environmentId: 1});
        });
    });
});
