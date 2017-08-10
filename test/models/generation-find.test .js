/* eslint-env node, mocha */
'use strict';

const should = require('should');

const plantJournal = require('../../src/pj');

const helpers = require('../helper-functions');

describe('Generation()', function() {
    describe('#find()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testFamily1'});
            await pj.Family.create({familyName: 'testFamily2'});
            await pj.Generation.create({familyId: 1, generationName: 'F1'});
            await pj.Generation.create({familyId: 1, generationName: 'F2'});
            await pj.Generation.create({familyId: 2, generationName: 'S1'});
            await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
            await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
            await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]});
        });

        it('should find and return generations and related families', async function() {
            let generations = await pj.Generation.find();

            generations.should.containDeep({
                'found': 4,
                'remaining': 0,
                'generations': {
                    '1': {
                        'generationId': 1,
                        'generationName': 'F1',
                        'generationParents': [],
                        'familyId': 1
                    },
                    '2': {
                        'generationId': 2,
                        'generationName': 'F2',
                        'generationParents': [],
                        'familyId': 1
                    },
                    '3': {
                        'generationId': 3,
                        'generationName': 'S1',
                        'generationParents': [],
                        'familyId': 2
                    },
                    '4': {
                        'generationId': 4,
                        'generationName': 'S2',
                        'generationParents': [1,2],
                        'familyId': 2
                    }
                },
                'families': {
                    '1': {
                        'familyId': 1,
                        'familyName': 'testFamily1'
                    },
                    '2': {
                        'familyId': 2,
                        'familyName': 'testFamily2'
                    }
                }
            });
            helpers
                .allGenerationsShouldHaveCreatedAtAndModifiedAtFields(generations);
            helpers
                .allFamiliesShouldHaveCreatedAtAndModifiedAtFields(generations);

        });

        it('should not have an family property if familyName is not in options.attributes', async function() {
            let generations = await pj.Generation.find(
                {
                    'attributes': ['familyId',
                        'generationName',
                        'generationParents']
                }
            );

            should(generations.families).be.undefined();

        });

        it('should skip x generations specified with options.offset and limit the count of results to option.limit', async function() {
            let generations = await pj.Generation
                .find(
                    {
                        'limit': 2,
                        'offset': 1
                    }
                );

            generations.should.containDeep({
                'found': 4,
                'remaining': 1,
                'generations': {
                    '2': {
                        'generationId': 2,
                        'generationName': 'F2',
                        'generationParents': [],
                        'familyId': 1
                    },
                    '3': {
                        'generationId': 3,
                        'generationName': 'S1',
                        'generationParents': [],
                        'familyId': 2
                    }
                },
                'families': {
                    '1': {
                        'familyId': 1,
                        'familyName': 'testFamily1'
                    },
                    '2': {
                        'familyId': 2,
                        'familyName': 'testFamily2'
                    }
                }
            });
        });

        it('should only return generations filter options.filter.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly', async function() {
            let generations = await pj.Generation.find({
                'filter': {
                    'familyId': 1
                }
            });

            generations.should.containDeep({
                'found': 2,
                'remaining': 0,
                'generations': {
                    '1': {
                        'generationId': 1,
                        'generationName': 'F1',
                        'generationParents': [],
                        'familyId': 1
                    },
                    '2': {
                        'generationId': 2,
                        'generationName': 'F2',
                        'generationParents': [],
                        'familyId': 1
                    }
                },
                'families': {
                    '1': {
                        'familyId': 1,
                        'familyName': 'testFamily1'
                    }
                }
            });
        });

        it('should only return generations filter options.filter.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly', async function() {
            let generations = await pj.Generation.find({
                'filter': {
                    'familyName': 'testFamily1'
                }
            });

            generations.should.containDeep({
                'found': 2,
                'remaining': 0,
                'families': {
                    '1': {
                        'familyId': 1,
                        'familyName': 'testFamily1'
                    }
                },
                'generations': {
                    '1': {
                        'generationId': 1,
                        'generationName': 'F1',
                        'generationParents': [],
                        'familyId': 1
                    },
                    '2': {
                        'generationId': 2,
                        'generationName': 'F2',
                        'generationParents': [],
                        'familyId': 1
                    }
                }
            });
        });

        it('should only return generations filter generation has only parents specified in options.filter.generationParents = [plantIdA, plantIdB]', async function() {
            let generations = await pj.Generation.find({'attributes': ['generationParents', 'generationName'], 'filter': {'generationParents': [1,2]}});

            generations.should.deepEqual({
                'found': 1,
                'remaining': 0,
                'generations': {
                    '4': {
                        'generationId': 4,
                        'generationName': 'S2',
                        'generationParents': [1, 2],
                        'familyId': 2
                    }
                }
            });
        });

        after(async function() {
            await pj.disconnect();
        });
    });
});
