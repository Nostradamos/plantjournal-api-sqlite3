/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe('Genotype()', () => {
    describe('#update()', () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({'familyName': 'testFamily1'}); //familyId: 1
            await pj.Generation.create({'generationName': 'F1', 'familyId': 1}); //generationId: 1
            await pj.Generation.create({'generationName': 'F2', 'familyId': 1}); //generationId: 2
            await pj.Family.create({'familyName': 'testFamily2'});  //familyId: 2
            await pj.Generation.create({'generationName': 'S1', 'familyId': 2}); //generationId: 3
            await pj.Generation.create({'generationName': 'S2', 'familyId': 2}); //generationId: 4
            await pj.Genotype.create({'genotypeName': 'F1Geno1', 'generationId': 1}); //genotypeId: 1
            await pj.Genotype.create({'genotypeName': 'F1Geno2', 'generationId': 1}); //genotypeId: 2
            await pj.Genotype.create({'genotypeName': 'F2Geno1', 'generationId': 2}); //genotypeId: 3
            await pj.Genotype.create({'genotypeName': 'S1Geno1', 'generationId': 3}); //genotypeId: 4
            await pj.Genotype.create({'genotypeName': 'S2Geno1', 'generationId': 4}); //genotypeId: 5
        });

        it('should throw error if no arguments got passed', async () => {
            await pj.Genotype.update()
                .should.be.rejectedWith('No Update and Critera Object got passed');
        });

        it('should throw error if no criteria object got passed', async () => {
            await pj.Genotype.update({})
                .should.be.rejectedWith('No Criteria Object got passed');
        });

        it('should throw error if first argument is not a assoc array/object', async () => {
            await pj.Genotype.update([], {})
                .should.be.rejectedWith('Update Object has to be an associative array');
        });

        it('should throw error if second argument is not an assoc array/object', async () => {
            await pj.Genotype.update({'generationName': 'newGenName'}, null)
                .should.be.rejectedWith('Criteria Object has to be an associative array');
        });

        it('should update generation in database and return an array containing the updated generationId', async () => {
            let updatedGen = await pj.Genotype
                .update({'genotypeName': 'F1Geno1Updated'}, {'filter': {'genotypeId': 1}});

            updatedGen.should.eql([1]);

            // Make sure family rows are untouched
            let rowsFam = await sqlite.all('SELECT familyId, familyName FROM ' + CONSTANTS.TABLE_FAMILY);

            rowsFam.should.deepEqual(
                [
                    {'familyId': 1, 'familyName': 'testFamily1'}, {'familyId': 2, 'familyName': 'testFamily2'}
                ]
            );

            let rowsGen = await sqlite.all('SELECT generationId, generationName FROM ' +  CONSTANTS.TABLE_GENERATION);

            rowsGen.should.deepEqual(
                [
                    {'generationId': 1, 'generationName': 'F1'},
                    {'generationId': 2, 'generationName': 'F2'},
                    {'generationId': 3, 'generationName': 'S1'},
                    {'generationId': 4, 'generationName': 'S2'}

                ]
            );

            let rowsGeno = await sqlite.all('SELECT genotypeId, genotypeName FROM ' + CONSTANTS.TABLE_GENOTYPE);

            rowsGeno.should.deepEqual(
                [
                    {'genotypeId': 1, 'genotypeName': 'F1Geno1Updated'},
                    {'genotypeId': 2, 'genotypeName': 'F1Geno2'},
                    {'genotypeId': 3, 'genotypeName': 'F2Geno1'},
                    {'genotypeId': 4, 'genotypeName': 'S1Geno1'},
                    {'genotypeId': 5, 'genotypeName': 'S2Geno1'}
                ]
            );
        });

        it('should also be possible to find multiple genotypes to update based on family attributes', async () => {
            let updatedGeno = await pj.Genotype
                .update({'genotypeName': 'NoGoodGenoName'}, {'filter': {'familyId': 2}});

            updatedGeno.should.eql([4,5]);
        });

        it('should also be possible to find multiple genotypes to update based on generation attributes', async () => {
            let updatedGeno = await pj.Genotype
                .update({'genotypeName': 'NoGoodGenoName'}, {'filter': {'generationId': 1}});

            updatedGeno.should.eql([1,2]);
        });

        it('should also be possible to limit/offset genotypes to update when found multiple', async () => {
            let updatedGeno = await pj.Genotype
                .update({'genotypeName': 'NoGoodGenoName'}, {'filter': {'familyId': 1}, 'offset': 1, 'limit': 2});

            updatedGeno.should.eql([2, 3]);
        });

        it('should not be possible to manually change genotypeModifiedAt', async () => {
            let updatedGeno = await pj.Generation.update(
                {'generationModifiedAt': 1},
                {'filter': {'genotypeId': 1}}
            );

            updatedGeno.length.should.eql(0);

            let rowsGeno = await sqlite.all(
                'SELECT genotypeId, genotypeModifiedAt FROM ' + CONSTANTS.TABLE_GENOTYPE  + ' WHERE genotypeId = 1'
            );

            rowsGeno[0].genotypeModifiedAt.should.not.eql(1);
        });

        it('should not be possible to manually change genotypeCreatedAt', async () => {
            let updatedGeno = await pj.Genotype.update(
                {'genotypeCreatedAt': 1},
                {'filter': {'genotypeId': 1}}
            );

            updatedGeno.length.should.eql(0);

            let rowsGeno = await sqlite.all(
                'SELECT genotypeId, genotypeCreatedAt FROM ' + CONSTANTS.TABLE_GENOTYPE  + ' WHERE genotypeId = 1'
            );

            rowsGeno[0].genotypeCreatedAt.should.not.eql(1);
        });

        it('should be possible to update generationId', async () => {
            let updatedGeno = await pj.Genotype.update(
                {'generationId': 2},
                {'filter': {'genotypeId': 5}}
            );

            updatedGeno.should.eql([5]);

            let rowsGeno = await sqlite.all(
                'SELECT genotypeId, generationId FROM ' + CONSTANTS.TABLE_GENOTYPE  + ' WHERE genotypeId = 5'
            );

            rowsGeno[0].generationId.should.eql(2);
        });

        it('should throw error if generationId does not reference existing generation', async () => {
            await pj.Genotype.update(
                {'generationId': 42},
                {'filter': {'genotypeId': 5}}
            ).should.be.rejectedWith('update.generationId does not reference an existing Generation');
        });
    });
});
