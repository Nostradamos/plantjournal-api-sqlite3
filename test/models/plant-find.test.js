/* eslint-env node, mocha */
require('should');

const plantJournal = require('../../src/pj');
const helpers = require('../helper-functions');

describe('Plant()', function() {
    describe('#find()', function() {
        let pj;

        before(async function() {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testFamily1'});
            await pj.Family.create({familyName: 'testFamily2'});
            await pj.Generation.create({familyId: 1, generationName: 'F1'});
            await pj.Generation.create({familyId: 1, generationName: 'F2'});
            await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
            await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
            await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
            await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2', plantSex: 'male'});

            await pj.Generation.create({familyId: 2, generationName: 'S1', generationParents: [1,2]});
            await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
            await pj.Plant.create({genotypeId: 3, plantName: 'testPlant3', plantSex: 'male'});
            await pj.Plant.create({plantName: 'testPlant4', plantClonedFrom: 3, plantSex: 'female'});
        });

        it('should find plants, referenced genotypes, generations and families', async function() {
            let plants = await pj.Plant.find();
            plants.should.containDeep(
                {
                    'found': 4,
                    'remaining': 0,
                    'plants': {
                        '1': {
                            'plantId': 1,
                            'plantName': 'testPlant1',
                            'plantClonedFrom': null,
                            'plantSex': null,
                            'genotypeId': 1,
                            'generationId': 1,
                            'familyId': 1
                        },
                        '2': {
                            'plantId': 2,
                            'plantName': 'testPlant2',
                            'plantClonedFrom': null,
                            'plantSex': 'male',
                            'genotypeId': 2,
                            'generationId': 2,
                            'familyId': 1
                        },
                        '3': {
                            'plantId': 3,
                            'plantName': 'testPlant3',
                            'plantClonedFrom': null,
                            'plantSex': 'male',
                            'genotypeId': 3,
                            'generationId': 3,
                            'familyId': 2
                        },
                        '4': {
                            'plantId': 4,
                            'plantName': 'testPlant4',
                            'plantClonedFrom': 3,
                            'plantSex': 'female',
                            'genotypeId': 3,
                            'generationId': 3,
                            'familyId': 2
                        }
                    },
                    'genotypes': {
                        '1': {
                            'genotypeId': 1,
                            'genotypeName': 'testGenotype1',
                            'generationId': 1,
                            'familyId': 1
                        },
                        '2': {
                            'genotypeId': 2,
                            'genotypeName': 'testGenotype2',
                            'generationId': 2,
                            'familyId': 1
                        },
                        '3': {
                            'genotypeId': 3,
                            'genotypeName': 'testGenotype3',
                            'generationId': 3,
                            'familyId': 2
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
                        },
                        '3': {
                            'generationId': 3,
                            'generationName': 'S1',
                            'generationParents': [1, 2],
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
                }
            );

            helpers
                .allPlantsShouldHaveCreatedAtAndModifiedAtFields(plants);
            helpers
                .allGenotypesShouldHaveCreatedAtAndModifiedAtFields(plants);
            helpers
                .allGenerationsShouldHaveCreatedAtAndModifiedAtFields(plants);
            helpers
                .allFamiliesShouldHaveCreatedAtAndModifiedAtFields(plants);
        });

        it('should not have an empty families property object if familyName is NOT in options.fields', async function() {
            let plants = await pj.Plant.find(
                {
                    'fields': ['familyId', 'generationName', 'genotypeName']
                }
            );
            plants.should.deepEqual({
                'found': 4,
                'remaining': 0,
                'genotypes': {
                    '1': { 'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1, 'familyId': 1 },
                    '2': { 'genotypeId': 2, 'genotypeName': 'testGenotype2', 'generationId': 2, 'familyId': 1 },
                    '3': { 'genotypeId': 3, 'genotypeName': 'testGenotype3', 'generationId': 3, 'familyId': 2 }
                },
                'generations': {
                    '1': { 'generationId': 1, 'familyId': 1, 'generationName': 'F1' },
                    '2': { 'generationId': 2, 'familyId': 1, 'generationName': 'F2' },
                    '3': { 'generationId': 3, 'familyId': 2, 'generationName': 'S1' }
                },
                'plants': {
                    '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
                    '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
                    '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
                    '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
                }
            });
        });

        it('should not have an empty generations property object if generationName is NOT in options.fields', async function() {
            let plants = await pj.Plant.find(
                {
                    'fields': ['familyId', 'genotypeName']
                }
            );
            plants.should.deepEqual({
                'found': 4,
                'remaining': 0,
                'genotypes': {
                    '1': { 'genotypeId': 1, 'genotypeName': 'testGenotype1', 'generationId': 1, 'familyId': 1 },
                    '2': { 'genotypeId': 2, 'genotypeName': 'testGenotype2', 'generationId': 2, 'familyId': 1 },
                    '3': { 'genotypeId': 3, 'genotypeName': 'testGenotype3', 'generationId': 3, 'familyId': 2 }
                },
                'plants': {
                    '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
                    '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
                    '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
                    '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
                }
            });
        });

        it('should not have an empty genotypes object if phenotyeName is NOT in options.fields', async function() {
            let plants = await pj.Plant.find(
                {
                    'fields': ['familyId']
                }
            );
            plants.should.deepEqual({
                'found': 4,
                'remaining': 0,
                'plants': {
                    '1': { 'plantId': 1, 'genotypeId': 1, 'generationId': 1, 'familyId': 1 },
                    '2': { 'plantId': 2, 'genotypeId': 2, 'generationId': 2, 'familyId': 1 },
                    '3': { 'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 },
                    '4': { 'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
                }
            });
        });

        it('should skip the first 3 plants if options.offset = 3 and limit plants to 1 if options.limit=1', async function() {
            let plants = await pj.Plant.find({'offset': 2, 'limit': 1, 'fields': ['plantName']});
            plants.should.deepEqual({
                'found': 4,
                'remaining': 1,
                'plants': {
                    '3': { 'plantId': 3, 'plantName': 'testPlant3', 'genotypeId': 3, 'generationId': 3, 'familyId': 2 }
                }
            });
        });

        it('should only return plants filter options.filter.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for plant fields)', async function() {
            let plants = await pj.Plant.find({'filter': {'plantName': 'testPlant3'}, 'fields': ['plantId']});
            plants.should.deepEqual({
                'found': 1,
                'remaining': 0,
                'plants': {
                    '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
                }

            });
        });

        it('should only return plants filter options.filter.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype fields)', async function() {
            let plants = await pj.Plant.find({'filter': {'genotypeName': 'testGenotype3'}, 'fields': ['plantId']});
            plants.should.deepEqual({
                'found': 2,
                'remaining': 0,
                'plants': {
                    '3': {'plantId': 3, 'genotypeId': 3, 'generationId': 3, 'familyId': 2},
                    '4': {'plantId': 4, 'genotypeId': 3, 'generationId': 3, 'familyId': 2}
                }
            });
        });

        it('should only return plants filter generation has only parents specified in options.filter.generationParents = [plantIdA, plantIdB]', async function() {
            let plants = await pj.Plant.find({'filter': {'generationParents': [1,2]}, 'fields': ['plantId', 'plantName', 'generationParents', 'generationName']});
            plants.should.deepEqual({
                'found': 2,
                'remaining': 0,
                'plants': {
                    '3': {
                        'plantId': 3,
                        'plantName': 'testPlant3',
                        'genotypeId': 3,
                        'generationId': 3,
                        'familyId': 2
                    },
                    '4': {
                        'plantId': 4,
                        'plantName': 'testPlant4',
                        'genotypeId': 3,
                        'generationId': 3,
                        'familyId': 2
                    }
                },
                'generations': {
                    '3': {
                        'generationId': 3,
                        'generationName': 'S1',
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
