/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../src/pj');

describe('Family()', function() {

    describe('#create()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();

            await pj.Family.create({'familyName': 'Foo X Bar'});
            await pj.Generation.create({'generationName': 'F1', 'familyId': 1});
            await pj.Plant.create({'plantName': 'testPlant1', 'generationId': 1});
        });

        it('should throw error if plantId is not set', async function() {
            await pj.PlantLog.create(
                {'plantLogTimestamp': 424242, 'plantLogType': 'log', 'plantLogValue': 'This is a log'})
                .should.be.rejectedWith('options.plantId has to be set');
        });

        it('should throw error if plantLogTimestamp is not set', async function() {
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogType': 'log', 'plantLogValue': 'This is a log'})
                .should.be.rejectedWith('options.plantLogTimestamp has to be set');
        });

        it('should throw error if plantLogType is not set', async function() {
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogValue': 'This is a log'})
                .should.be.rejectedWith('options.plantLogType has to be set');
        });

        it('should throw error if plantLogValue is not set', async function() {
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogType': 'log'})
                .should.be.rejectedWith('options.plantLogValue has to be set');
        });

        it('should throw error if plantLogType is not a string', async function() {
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogType': 13, 'plantLogValue': 'This is a log' })
                .should.be.rejectedWith('options.plantLogType has to be a string');
        });

        it('should throw error if plantId is not an existing plant', async function() {
            await pj.PlantLog.create(
                {'plantId': 42, 'plantLogTimestamp': 424242, 'plantLogType': 'log', 'plantLogValue': 'This is a log' })
                .should.be.rejectedWith('options.plantId does not reference an existing Plant');
        });

        it('should create database record and return inserted plantLog', async function() {
            let plantLog = await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogType': 'log', 'plantLogValue': 'This is a log'}
            );

            let [pLCreatedAt, pLModifiedAt] = [
                plantLog.plantLogs[1].plantLogCreatedAt,
                plantLog.plantLogs[1].plantLogModifiedAt
            ];

            pLCreatedAt.should.eql(pLModifiedAt);

            plantLog.should.deepEqual(
                {
                    'plantLogs': {
                        1: {
                            'plantId': 1,
                            'plantLogId': 1,
                            'plantLogTimestamp': 424242,
                            'plantLogType': 'log',
                            'plantLogValue': 'This is a log',
                            'plantLogCreatedAt': pLCreatedAt,
                            'plantLogModifiedAt': pLModifiedAt
                        }
                    }
                }
            );

            let result = await sqlite.all(
                `SELECT plantId, plantLogId, plantLogTimestamp, plantLogType, plantLogValue, plantLogCreatedAt, plantLogModifiedAt FROM plant_logs`
            );

            result[0].should.deepEqual(plantLog.plantLogs[1]);
        });
    });
});
