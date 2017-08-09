/* eslint-env node, mocha */
'use strict';

require('should');
const plantJournal = require('../../src/pj');
const sqlite = require('sqlite');

describe('Generation()', function() {
    describe('#create()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testName'});
        });

        it('should throw error if options.familyId is not an integer', async function() {
            await pj.Generation.create({'generationName': 'testGeneration2', 'familyId': '1'})
                .should.be.rejectedWith('options.familyId has to be an integer');
        });

        it('should throw error if options.generationName is not set', async function() {
            await pj.Generation.create({'familyId': 1})
                .should.be.rejectedWith('options.generationName has to be set');
        });

        it('should throw error if options.generationName is not a string', async function() {
            await pj.Generation.create({'familyId': 1, 'generationName': 1})
                .should.be.rejectedWith('options.generationName has to be a string');
        });

        it('should throw error if generationParents is set but not an array', async function() {
            await pj.Generation.create({'familyId': 1, 'generationName': 'test', 'generationParents': {}})
                .should.be.rejectedWith('options.generationParents has to be an array of integers');
        });

        it('should throw Error if familyId does not reference an entry in families', async function() {
            await pj.Generation.create({'familyId': 1337, 'generationName': 'testGeneration3'})
                .should.be.rejectedWith('options.familyId does not reference an existing Family');
            let result = await sqlite.all('SELECT familyId, generationId, generationName FROM generations WHERE generationName = "testGeneration3"');
            result.should.deepEqual([]);
        });

        it('should create a new generations entry and return generation object', async function() {
            let generation = await pj.Generation.create({'familyId': 1, 'generationName': 'testGeneration'});
            let [createdAt, modifiedAt] = [generation.generations[1].generationCreatedAt, generation.generations[1].generationModifiedAt];
            createdAt.should.eql(modifiedAt);
            generation.should.deepEqual({
                generations: {
                    '1': {
                        'generationId': 1,
                        'generationDescription': '',
                        'generationName': 'testGeneration',
                        'generationParents': [],
                        'familyId': 1,
                        'generationCreatedAt': createdAt,
                        'generationModifiedAt': modifiedAt
                    }
                }
            });

            let result = await sqlite.all(
                `SELECT familyId, generationId, generationDescription, generationName,
         generationCreatedAt, generationModifiedAt FROM generations`);
            result.should.deepEqual(
                [
                    {
                        'familyId': 1,
                        'generationId': 1,
                        'generationDescription': '',
                        'generationName': 'testGeneration',
                        'generationCreatedAt': createdAt,
                        'generationModifiedAt': modifiedAt
                    }
                ]
            );
        });

        it('should throw error if options is not set or not an associative array', async function() {
            let tested = 0;
            for (let value in [[1,2], null, 'string', 1, true, undefined]) {
                await pj.Generation.create(value)
                    .should.be.rejectedWith('First argument has to be an associative array');
                tested++;
            }
            tested.should.eql(6);
        });

        it('should throw Error if options.familyId is not set', async function() {
            await pj.Generation.create({'generationName': 'testGeneration2'})
                .should.be.rejectedWith('options.familyId has to be set');
        });

        after(async function() {
            await pj.disconnect();
        });
    });

    describe('#create() (with options.generationParents)', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testName'});
            await pj.Generation.create({familyId: 1, generationName: 'F1'});
            await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
            await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
        });

        after(async function() {
            await pj.disconnect();
        });

        it('should also add parents if options.generationParents is specified', async function() {
            let generation = await pj.Generation.create(
                {
                    'familyId': 1,
                    'generationName': 'testWithParents',
                    'generationParents': [1,2]
                }
            );
            let [createdAt, modifiedAt] = [generation.generations[2].generationCreatedAt, generation.generations[2].generationModifiedAt];
            generation.should.deepEqual({
                'generations': {
                    '2': {
                        'generationId': 2,
                        'generationDescription': '',
                        'generationName': 'testWithParents',
                        'generationParents': [1,2],
                        'generationCreatedAt': createdAt,
                        'generationModifiedAt': modifiedAt,
                        'familyId': 1
                    }
                }
            });
            let rows = await sqlite.all('SELECT * FROM generation_parents');
            rows.should.deepEqual(
                [
                    {'parentId': 1, 'generationId': 2, 'plantId': 1},
                    {'parentId': 2, 'generationId': 2, 'plantId': 2}
                ]
            );
        });

        it('should throw error if options.generationParents does not reference existing plants and not add generation', async function() {
            await pj.Generation.create(
                {
                    'familyId': 1,
                    'generationName': 'testWithParents2',
                    'generationParents': [1, 42]
                }
            ).should.be.rejectedWith(
                'options.generationParents contains at least one plantId which does not reference an existing plant'
            );

            let rowsGen = await sqlite.all('SELECT generationId, generationName FROM generations WHERE generationName = "testWithParents2"');
            rowsGen.should.deepEqual([]);
        });
    });
});
