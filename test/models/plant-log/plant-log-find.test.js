/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../src/pj');

describe('PlantLog()', function() {
    describe('#create()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();

            await pj.Family.create({'familyName': 'Foo X Bar'});
            await pj.Generation.create({'generationName': 'F1', 'familyId': 1});
            await pj.Plant.create({'plantName': 'testPlant1', 'generationId': 1});
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424242,
                    'plantLogType': 'log',
                    'plantLogValue': 'Watered the plant and noticed bugs on leaves.'
                }
            );
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424242,
                    'plantLogType': 'todo',
                    'plantLogValue': 'Buy and apply ladybugs against varmints.'
                }
            );
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424342,
                    'plantLogType': 'log',
                    'plantLogValue': 'Bugs are gone, ladybugs love the plants!.'
                }
            );
        });

        it('should return all logs', async function() {
            let plantLogs = await pj.PlantLog.find({});

            plantLogs.plantLogs.should.containDeep(
                {
                    424242: {
                        1: {
                            'plantId': 1,
                            'plantLogTimestamp': 424242,
                            'plantLogType': 'log',
                            'plantLogValue': 'Watered the plant and noticed bugs on leaves.'
                        },
                        2: {
                            'plantId': 1,
                            'plantLogTimestamp': 424242,
                            'plantLogType': 'todo',
                            'plantLogValue': 'Buy and apply ladybugs against varmints.'
                        }
                    },
                    424342: {
                        3: {
                            'plantId': 1,
                            'plantLogTimestamp': 424342,
                            'plantLogType': 'log',
                            'plantLogValue': 'Bugs are gone, ladybugs love the plants!.'
                        }
                    }
                }
            );
        });
    });
});
