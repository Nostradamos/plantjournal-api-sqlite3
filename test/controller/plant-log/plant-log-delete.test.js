/* eslint-env node, mocha */
'use strict';

require('should');

const sqlite = require('sqlite');

const CONSTANTS = require('../../../src/constants');

const plantJournal = require('../../../src/pj');


describe('PlantLog()', () => {

    describe('#delete()', () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();

            await pj.Family.create({'familyName': 'Foo X Bar'});
            await pj.Generation.create({'generationName': 'F1', 'familyId': 1});
            await pj.Plant.create({'plantName': 'testPlant1', 'generationId': 1});

            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogType': 'test', 'plantLogValue': 'test'}
            );
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424242, 'plantLogType': 'test', 'plantLogValue': 'test2'}
            );
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424342, 'plantLogType': 'test', 'plantLogValue': 'test4'}
            );
            await pj.PlantLog.create(
                {'plantId': 1, 'plantLogTimestamp': 424342, 'plantLogType': 'test', 'plantLogValue': 'test5'}
            );
        });

        it('should throw error if no criteria object got passed', async () => {
            await pj.PlantLog.delete()
                .should.be.rejectedWith('No criteria object passed');
        });

        it('should delete plantLogs specified in criteria.filter.plantLogId from database and return an array of deleted plantLogIds', async () => {
            let deletedPlantLogs = await pj.PlantLog.delete(
                {filter: {plantLogId: '3'}}
            );
            deletedPlantLogs.should.eql({'plantLogs': [3]});

            // Make sure we deleted also from database
            let rowsPlantLogs = await sqlite.all('SELECT plantLogId FROM ' + CONSTANTS.TABLE_PLANT_LOG);
            rowsPlantLogs.should.deepEqual([
                {'plantLogId': 1},
                {'plantLogId': 2},
                {'plantLogId': 4},
            ]);
        });

        it('should be possible to use criteria.limit and criteria.filter with plantId attribute', async () => {
            let deletedPlantLogs = await pj.PlantLog.delete(
                {filter: {plantId: 1}, limit: 1}
            );
            deletedPlantLogs.should.eql({'plantLogs': [1]});
        });

        it('should be possible to use criteria.sort', async () => {
            let deletedPlantLogs = await pj.PlantLog.delete(
                {sort: 'plantLogId DESC', limit: 1}
            );
            deletedPlantLogs.should.eql({'plantLogs': [4]});
        });
    });
});
