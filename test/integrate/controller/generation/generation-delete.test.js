/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe('Generation()', () => {
    describe('#delete()', async () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'test1'}); // familyId:1
            await pj.Generation.create({generationName : 'testGen1', familyId: 1}); // generationId: 1
            await pj.Plant.create({generationId: 1, plantName: 'blubb'}); // plantId: 1 genotypeId: 1
            await pj.Plant.create({generationId: 1, plantName: 'blubb2'}); // plantId: 2 genotyeId: 2

            await pj.Family.create({familyName: 'testB'}); // id:2
            await pj.Generation.create({generationName : 'testGen2', familyId: 2}); // generationId: 2
            await pj.Generation.create({generationName : 'testGen3', familyId: 2}); // generationId: 3
            await pj.Plant.create({generationId: 2, plantName: 'blubb'}); // plantId: 3 genotypeId: 3

            await pj.Family.create({familyName: 'test3'}); // id:3
            await pj.Generation.create({generationName : 'testGen4', familyId: 3}); // generationId: 4
            await pj.Genotype.create({generationId: 4, genotypeName: 'testGeno1'}); // genotypeId: 4
            await pj.Genotype.create({generationId: 4, genotypeName: 'testGeno2'}); // genotypeId: 5


            await pj.Family.create({familyName: 'testD'}); // id:4
        });

        it('should throw error if no criteria object got passed', async () => {
            await pj.Generation.delete()
                .should.be.rejectedWith('No criteria object passed');
        });

        it('should delete generation specified in criteria.filter.generationId and downwards referenced genotypes/plants', async () => {
            let deletedGen = await pj.Generation.delete(
                {
                    'filter': {
                        'generationId': 1
                    }
                }
            );

            deletedGen.should.deepEqual(
                {
                    'generations': [1],
                    'genotypes': [1,2],
                    'plants': [1,2]
                }
            );

            // Make sure we deleted also from database

            let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILY);

            rowsFam.should.deepEqual(
                [
                    {'familyId': 1, 'familyName': 'test1'},
                    {'familyId': 2, 'familyName': 'testB'},
                    {'familyId': 3, 'familyName': 'test3'},
                    {'familyId': 4, 'familyName': 'testD'}
                ]
            );

            let rowsGen = await sqlite.all('SELECT generationId, generationName FROM ' +  CONSTANTS.TABLE_GENERATION);

            rowsGen.should.deepEqual(
                [
                    {'generationId': 2, 'generationName': 'testGen2'},
                    {'generationId': 3, 'generationName': 'testGen3'},
                    {'generationId': 4, 'generationName': 'testGen4'}
                ]
            );

            let rowsGeno = await sqlite.all('SELECT genotypeId, genotypeName FROM ' + CONSTANTS.TABLE_GENOTYPE);

            rowsGeno.should.deepEqual(
                [
                    {'genotypeId': 3, 'genotypeName': ''},
                    {'genotypeId': 4, 'genotypeName': 'testGeno1'},
                    {'genotypeId': 5, 'genotypeName': 'testGeno2'}
                ]
            );

            let rowsPlant = await sqlite.all('SELECT plantId, plantName FROM ' + CONSTANTS.TABLE_PLANT);

            rowsPlant.should.deepEqual(
                [
                    {'plantId': 3, 'plantName': 'blubb'}
                ]
            );
        });
    });
});
