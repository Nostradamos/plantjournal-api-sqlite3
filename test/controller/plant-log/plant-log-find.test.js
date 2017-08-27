/* eslint-env node, mocha */
'use strict';

require('should');

const plantJournal = require('../../../src/pj');

describe('PlantLog()', () => {
    describe('#create()', () => {
        let pj;

        before(async () => {
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
            ); //plantLogId: 1
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424242,
                    'plantLogType': 'todo',
                    'plantLogValue': 'Buy and apply ladybugs against varmints.'
                }
            ); //plantLogId: 2
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424342,
                    'plantLogType': 'log',
                    'plantLogValue': 'Bugs are gone, ladybugs love the plants!.'
                }
            ); //plantLogId: 3
            await pj.PlantLog.create(
                {
                    'plantId': 1,
                    'plantLogTimestamp': 424342,
                    'plantLogType': 'testInt',
                    'plantLogValue': 1334
                }
            ); //plantLogId: 4
        });

        it('should return all logs', async () => {
            let plantLogs = await pj.PlantLog.find();

            plantLogs.should.containDeep(
                {
                    'found': 4,
                    'remaining': 0,
                    'plantLogs': {
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
                            },
                            4: {
                                'plantId': 1,
                                'plantLogTimestamp': 424342,
                                'plantLogType': 'testInt',
                                'plantLogValue': 1334
                            }
                        }
                    }
                }
            );
        });

        it('should be possible to use criteria.filter', async () => {
            let plantLogs = await pj.PlantLog.find({'filter': {'plantLogTimestamp': 424242}});

            plantLogs.should.containDeep(
                {
                    'found': 2,
                    'remaining': 0,
                    'plantLogs': {
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
                    }
                }
            );
        });

        it('should set plantsLogs timestamp key and plantLogs plantLogId key even if they are not selected in attributes', async () => {
            let plantLogs = await pj.PlantLog.find(
                {'attributes': ['plantLogType'], 'filter': {'plantLogTimestamp': 424242}}
            );

            plantLogs.should.containDeep(
                {
                    'found': 2,
                    'remaining': 0,
                    'plantLogs': {
                        424242: {
                            1: {
                                'plantLogType': 'log',
                            },
                            2: {
                                'plantLogType': 'todo',
                            }
                        },
                    }
                }
            );
        });
    });
});
