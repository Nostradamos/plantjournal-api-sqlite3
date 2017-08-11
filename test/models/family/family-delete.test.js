/* eslint-env node, mocha */
'use strict';

const sqlite = require('sqlite');

require('should');

const plantJournal = require('../../../src/pj');
const CONSTANTS = require('../../../src/constants');

describe('Family()', function() {
    describe('#delete()', function() {
        let pj;

        before(async function() {
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

        it('should throw error if no criteria object got passed', async function() {
            await pj.Family.delete()
                .should.be.rejectedWith('No criteria object passed');
        });

        it('should delete specified family in criteria.filter.familyId and return the id', async function() {
            let deletedFam = await pj.Family.delete(
                {
                    'filter': {
                        'familyId': 1
                    }
                }
            );

            deletedFam.should.deepEqual({
                'families': [1],
                'generations': [1],
                'genotypes': [1, 2],
                'plants': [1, 2]
            });

            // Make sure we deleted also from database

            let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILIES);

            rowsFam.should.deepEqual(
                [
                    {'familyId': 2, 'familyName': 'testB'},
                    {'familyId': 3, 'familyName': 'test3'},
                    {'familyId': 4, 'familyName': 'testD'}
                ]
            );

            let rowsGen = await sqlite.all('SELECT generationId, generationName FROM ' + CONSTANTS.TABLE_GENERATIONS);

            rowsGen.should.deepEqual(
                [
                    {'generationId': 2, 'generationName': 'testGen2'},
                    {'generationId': 3, 'generationName': 'testGen3'},
                    {'generationId': 4, 'generationName': 'testGen4'}
                ]
            );

            let rowsGeno = await sqlite.all('SELECT genotypeId, genotypeName FROM ' + CONSTANTS.TABLE_GENOTYPES);

            rowsGeno.should.deepEqual(
                [
                    {'genotypeId': 3, 'genotypeName': ''},
                    {'genotypeId': 4, 'genotypeName': 'testGeno1'},
                    {'genotypeId': 5, 'genotypeName': 'testGeno2'}
                ]
            );

            let rowsPlant = await sqlite.all('SELECT plantId, plantName FROM ' + CONSTANTS.TABLE_PLANTS);

            rowsPlant.should.deepEqual(
                [
                    {'plantId': 3, 'plantName': 'blubb'}
                ]
            );
        });

        it('should be possibe to delete families with criteria.sort and criteria.limit instruction', async function() {
            let deletedFam = await pj.Family.delete(
                {
                    'limit': 2,
                    'sort': 'familyId DESC'
                }
            );

            deletedFam.families.should.eql([4, 3]);
        });
    });
});
