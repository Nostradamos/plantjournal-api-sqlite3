/* eslint-env node, mocha */
'use strict';

const should = require('should');
const sqlite = require('sqlite');

const Utils = require('../../../src/utils');
const CONSTANTS = require('../../../src/constants');

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

        it('should throw error if we try to update plantId to a non existing plant', async function() {
            await pj.PlantLog.update(
                {plantId: 42},
                {filter: {plantLogId: 3}}
            ).should.be.rejectedWith('update.plantId does not reference an existing plant');
        });

        it('should return updated plantLogId, update requested changes in plantLog record, and update plantLogModifiedAt', async function() {
            let updatedPlantLogs = await pj.PlantLog.update(
                {plantLogValue: 'Bugs are gone, ladybugs love the plants! Besides that, it looks like the chilis finally start to produce flowers!'},
                {filter: {plantLogId: 3}}
            );

            updatedPlantLogs.should.eql([3]);

            let rows = await sqlite.all(`SELECT * FROM ` + CONSTANTS.TABLE_PLANT_LOGS + ``);
            rows.should.containDeep(
                [
                    {
                        'plantLogId': 1,
                        'plantId': 1,
                        'plantLogTimestamp': 424242,
                        'plantLogType': 'log',
                        'plantLogValue': 'Watered the plant and noticed bugs on leaves.'
                    },
                    {
                        'plantLogId': 2,
                        'plantId': 1,
                        'plantLogTimestamp': 424242,
                        'plantLogType': 'todo',
                        'plantLogValue': 'Buy and apply ladybugs against varmints.'
                    },
                    {
                        'plantLogId': 3,
                        'plantId': 1,
                        'plantLogTimestamp': 424342,
                        'plantLogType': 'log',
                        'plantLogValue': 'Bugs are gone, ladybugs love the plants! Besides that, it looks like the chilis finally start to produce flowers!'
                    },
                    {
                        'plantLogId': 4,
                        'plantId': 1,
                        'plantLogTimestamp': 424342,
                        'plantLogType': 'testInt',
                        'plantLogValue': 1334
                    }
                ]
            );
        });
    });
});
