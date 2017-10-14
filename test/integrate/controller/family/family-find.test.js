/* eslint-env node, mocha */
'use strict';

const plantJournal = require('../../../../src/pj');
const helpers = require('../../../helper-functions');

require('should');

describe(`Family()`, () => {
    describe(`#find()`, () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'test1'});
            await pj.Family.create({familyName: 'testB'});
            await pj.Family.create({familyName: 'test3'});
            await pj.Family.create({familyName: 'testD'});
        });

        after(async () => {
            await pj.disconnect();
        });

        it(`should return all families`, async () => {
            let families = await pj.Family.find();

            families.should.containDeep({
                found: 4,
                remaining: 0,
                families: {
                    '1': { familyId: 1, familyName: 'test1' },
                    '2': { familyId: 2, familyName: 'testB' },
                    '3': { familyId: 3, familyName: 'test3' },
                    '4': { familyId: 4, familyName: 'testD' }
                }
            });
            helpers.allFamiliesShouldHaveCreatedAtAndModifiedAt(families);
        });

        it(`should only return the first two families if options.limit=2`, async () => {
            let families = await pj.Family.find({limit: 2, attributes: ['familyId', 'familyName']});

            families.should.deepEqual({
                found: 4,
                remaining: 2,
                families: {
                    '1': { familyId: 1, familyName: 'test1' },
                    '2': { familyId: 2, familyName: 'testB' }
                }
            });
        });

        it(`should only return the the last two families if options.offset=2 and options.limit=2`, async () => {
            let families = await pj.Family.find({offset: 2, limit: 2, attributes: ['familyId', 'familyName']});

            families.should.deepEqual({
                found: 4,
                remaining: 0,
                families: {
                    '3': { familyId: 3, familyName: 'test3' },
                    '4': { familyId: 4, familyName: 'testD' }
                }
            });
        });

        it(`should only return families where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches extactly`, async () => {
            let families = await pj.Family.find(
                {
                    where : {
                        'familyId': 3
                    },
                    attributes: ['familyId', 'familyName']
                }
            );

            families.should.deepEqual({
                found: 1,
                remaining: 0,
                families: {
                    '3': { familyId: 3, familyName: 'test3' }
                }
            });
        });

        it(`should only return families where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly`, async () => {
            let families = await pj.Family.find(
                {
                    where : {
                        'familyName': 'testD'
                    },
                    attributes: ['familyId', 'familyName']
                }
            );

            families.should.deepEqual({
                found: 1,
                remaining: 0,
                families: {
                    '4': { familyId: 4, familyName: 'testD' }
                }
            });
        });

        it(`should be possible to sort returned families`, async () => {
            let families = await pj.Family.find({sort: 'familyId DESC', limit: 2});

            families.families.should.containDeep({
                '4': { familyId: 4, familyName: 'testD' },
                '3': { familyId: 3, familyName: 'test3' },
            });
        });
    });

    describe(`familyGenerations attribute`, () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'Family1'});
            await pj.Generation.create({generationName: 'Gen1', familyId: 1});
            await pj.Generation.create({generationName: 'Gen2', familyId: 1});
            await pj.Family.create({familyName: 'Family2'});
            await pj.Generation.create({generationName: 'Gen3', familyId: 2});
            await pj.Generation.create({generationName: 'Gen4', familyId: 2});
            await pj.Family.create({familyName: 'Family3'});
        });

        after(async () => {
            await pj.disconnect();
        });

        it(`should find all families and the familyGenerations attribute should be an array containing all related generation ids`, async () => {
            let families = await pj.Family.find();
            families.should.containDeep(
                {
                    found: 3,
                    remaining: 0,
                    families: {
                        1: {
                            familyName: 'Family1',
                            familyGenerations: [1, 2]
                        },
                        2: {
                            familyName: 'Family2',
                            familyGenerations: [3, 4]
                        },
                        3: {
                            familyName: 'Family3',
                            familyGenerations: []
                        }
                    }
                }
            );
        });

        it(`should only find families which have a specific generation if we set {where:{familyGenerations:{$has:3}}}`, async () => {
            let families = await pj.Family.find(
                {where:{familyGenerations:{$has:3}}});
            families.should.containDeep(
                {
                    found: 1,
                    remaining: 0,
                    families: {
                        2: {
                            familyName: 'Family2',
                            familyGenerations: [3, 4]
                        }
                    }
                }
            );
        });
    });
});
