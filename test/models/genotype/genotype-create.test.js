/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../src/pj');

describe('Genotype()', function() {
    describe('#create()', function() {
        let pj;

        beforeEach(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testFamily1'});
            await pj.Generation.create({familyId: 1, generationName: 'F1'});
        });

        it('should throw error if options is not set or not an associative array', async function() {
            let tested = 0;

            for (let value in [[1,2],
                null,
                'string',
                1,
                true,
                undefined]) {
                await pj.Genotype.create(value)
                    .should.be.rejectedWith('First argument has to be an associative array');
                tested++;
            }
            tested.should.eql(6);
        });

        it('should throw an error if options.generationId is not set', async function() {
            await pj.Genotype.create({})
                .should.be.rejectedWith('options.generationId has to be set');
        });

        it('should throw error if options.generationId is not an integer', async function() {
            await pj.Genotype.create({generationId: '1'})
                .should.be.rejectedWith('options.generationId has to be an integer');
        });

        it('should throw an error if options.generationId does not reference a generation', async function() {
            await pj.Genotype.create({generationId: 1337})
                .should.be.rejectedWith('options.generationId does not reference an existing Generation');
        });

        it('should throw error if options.genotypeName is not a string', async function() {
            await pj.Genotype.create({generationId: 1, genotypeName: 1})
                .should.be.rejectedWith('options.genotypeName has to be a string');
        });

        it('should create a new genotypes entry and return Genotypes Object', async function() {
            let genotype = await pj.Genotype.create(
                {
                    generationId: 1,
                    genotypeName: 'testGenotype1',
                    genotypeDescription: 'this is a very special genotype'
                }
            );
            let [createdAt, modifiedAt] = [genotype.genotypes[1].genotypeCreatedAt, genotype.genotypes[1].genotypeModifiedAt];

            genotype.should.deepEqual({
                'genotypes': {
                    '1': {
                        'genotypeId': 1,
                        'genotypeName': 'testGenotype1',
                        'genotypeDescription': 'this is a very special genotype',
                        'generationId': 1,
                        'genotypeCreatedAt': createdAt,
                        'genotypeModifiedAt': modifiedAt
                    }
                }
            });

            let rows = await sqlite.all(
                `SELECT genotypeId, genotypeName, genotypeDescription, generationId,
        genotypeCreatedAt, genotypeModifiedAt FROM genotypes`
            );

            rows[0].should.deepEqual(genotype.genotypes[1]);
        });

        it('should be possible to create a new genotype with genotypeName not set', async function() {
            let genotype = await pj.Genotype.create({generationId: 1});
            let [createdAt, modifiedAt] = [genotype.genotypes[1].genotypeCreatedAt, genotype.genotypes[1].genotypeModifiedAt];

            genotype.should.deepEqual({
                'genotypes': {
                    '1': {
                        'genotypeId': 1,
                        'genotypeName': '',
                        'genotypeDescription': '',
                        'genotypeCreatedAt': createdAt,
                        'genotypeModifiedAt': modifiedAt,
                        'generationId': 1
                    }
                }
            });
        });

        afterEach(async function() {
            await pj.disconnect();
        });
    });
});
