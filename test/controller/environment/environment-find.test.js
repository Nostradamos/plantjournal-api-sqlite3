/* eslint-env node, mocha */
'use strict';

const plantJournal = require('../../../src/pj');
const helpers = require('../../helper-functions');

require('should');

describe('Environment()', () => {
    describe('#find()', () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Environment.create({environmentName: 'Greenhouse #1', environmentDescription: 'This is the first greenhouse in my garden.'});
            await pj.Environment.create({environmentName: 'Greenhouse #2', environmentDescription: 'This is the second greenhouse in my garden.'});
            await pj.Environment.create({environmentName: 'Growbox #1', environmentDescription: 'Small growbox to keep mother plants all over the year.'});
            await pj.Environment.create({environmentName: 'Allotment garden #1', environmentDescription: 'Allotment garden where i usually plant all food producing plants or test new varities.'});
        });

        after(async () => {
            await pj.disconnect();
        });


        it('should return all environments', async () => {
            let environments = await pj.Environment.find();

            environments.should.containDeep({
                found: 4,
                remaining: 0,
                environments: {
                    '1': {
                        environmentId: 1,
                        environmentName: 'Greenhouse #1',
                        environmentDescription: 'This is the first greenhouse in my garden.'
                    },
                    '2': {
                        environmentId: 2,
                        environmentName: 'Greenhouse #2',
                        environmentDescription: 'This is the second greenhouse in my garden.'
                    },
                    '3': {
                        environmentId: 3,
                        environmentName: 'Growbox #1',
                        environmentDescription: 'Small growbox to keep mother plants all over the year.'
                    },
                    '4': {
                        environmentId: 4,
                        environmentName: 'Allotment garden #1',
                        environmentDescription: 'Allotment garden where i usually plant all food producing plants or test new varities.'
                    }
                }
            });
        });
    });
});
