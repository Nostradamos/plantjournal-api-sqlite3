/* eslint-env node, mocha */
'use strict';

const plantJournal = require('../../../../src/pj');

require('should');

describe('Journal()', () => {
    describe('#find()', () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Environment.create({environmentName: 'Greenhouse #1', environmentDescription: 'This is the first greenhouse in my garden.'});
            await pj.Medium.create({mediumName: 'Pot #1', environmentId: 1});
            await pj.Medium.create({mediumName: 'Pot #2', environmentId: 1});
            await pj.Genotype.create({});
            await pj.Plant.create({plantName: 'testPlant1', genotypeId: 1});

            await pj.Journal.create({journalTimestamp: 1337, journalType: 'log', journalValue: 'This is a log', plantId: 1});
            await pj.Journal.create({journalTimestamp: 1337, journalType: 'ph-sensor', journalValue: 6.5, mediumId: 1});
            await pj.Journal.create({journalTimestamp: 1337, journalType: 'ec-sensor', journalValue: 1.3, mediumId: 1});
            await pj.Journal.create({journalTimestamp: 1337, journalType: 'temp-sensor', journalValue: 28.7, environmentId: 1});
            await pj.Journal.create({journalTimestamp: 1555, journalType: 'log', journalValue: 'This is a log', plantId: 1});
            await pj.Journal.create({journalTimestamp: 1555, journalType: 'watering', journalValue: '{"amount": 1.5, "n": 3, "p": 4, "k": 1.7, "fertilizers": ["Hakaphos Grün", "Hakaphos Blau"]}', mediumId: 1});
            await pj.Journal.create({journalTimestamp: 1337, journalType: 'ph-sensor', journalValue: 6.8, mediumId: 2});
        });

        after(async () => {
            await pj.disconnect();
        });


        it('should return all journals', async () => {
            let journals = await pj.Journal.find();
            journals.should.containDeep(
                {
                    found: 7,
                    remaining: 0,
                    journals:  {
                        '1': {
                            journalId: 1,
                            journalTimestamp: 1337,
                            journalType: 'log',
                            journalValue: '"This is a log"',
                            plantId: 1
                        },
                        '2': {
                            journalId: 2,
                            journalTimestamp: 1337,
                            journalType: 'ph-sensor',
                            journalValue: 6.5,
                            mediumId: 1
                        },
                        '3': {
                            journalId: 3,
                            journalTimestamp: 1337,
                            journalType: 'ec-sensor',
                            journalValue: 1.3,
                            mediumId: 1
                        },
                        '4': {
                            journalId: 4,
                            journalTimestamp: 1337,
                            journalType: 'temp-sensor',
                            journalValue: 28.7,
                            environmentId: 1
                        },
                        '5': {
                            journalId: 5,
                            journalTimestamp: 1555,
                            journalType: 'log',
                            journalValue: '"This is a log"',
                            plantId: 1
                        },
                        '6': {
                            journalId: 6,
                            journalTimestamp: 1555,
                            journalType: 'watering',
                            journalValue: '{"amount":1.5,"n":3,"p":4,"k":1.7,"fertilizers":["Hakaphos Grün","Hakaphos Blau"]}',
                            mediumId: 1
                        },
                        '7': {
                            journalId: 7,
                            journalTimestamp: 1337,
                            journalType: 'ph-sensor',
                            journalValue: 6.8
                        }
                    }
                }
            );
        });

        it('should be possible to find journals for a specific medium', async () => {
            let journals = await pj.Journal.find({filter: {mediumId: {'$neq': null}}});
            journals.should.containDeep(
                {
                    found: 4,
                    remaining: 0,
                    journals:  {
                        '2': {
                            journalId: 2,
                            journalTimestamp: 1337,
                            journalType: 'ph-sensor',
                            journalValue: 6.5,
                            mediumId: 1
                        },
                        '3': {
                            journalId: 3,
                            journalTimestamp: 1337,
                            journalType: 'ec-sensor',
                            journalValue: 1.3,
                            mediumId: 1
                        },
                        '6': {
                            journalId: 6,
                            journalTimestamp: 1555,
                            journalType: 'watering',
                            journalValue: '{"amount":1.5,"n":3,"p":4,"k":1.7,"fertilizers":["Hakaphos Grün","Hakaphos Blau"]}',
                            mediumId: 1
                        },
                        '7': {
                            journalId: 7,
                            journalTimestamp: 1337,
                            journalType: 'ph-sensor',
                            journalValue: 6.8
                        }
                    }
                }
            );
        });
    });
});
