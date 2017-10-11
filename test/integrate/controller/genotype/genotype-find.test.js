/* eslint-env node, mocha */
'use strict';

const should = require('should');

const plantJournal = require('../../../../src/pj');

const helperFunctions = require('../../../helper-functions');

describe(`Genotype()`, () => {
    describe(`#find()`, () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Family.create({familyName: 'testFamily1'});
            await pj.Family.create({familyName: 'testFamily2'});
            await pj.Generation.create({familyId: 1, generationName: 'F1'});
            await pj.Generation.create({familyId: 1, generationName: 'F2'});
            await pj.Generation.create({familyId: 2, generationName: 'S1'});
            await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
            await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
            await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
            await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
            await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2'});
            await pj.Generation.create({familyId: 2, generationName: 'generationWithParents', generationParents: [1,2]});
            await pj.Genotype.create({generationId: 4, genotypeName: 'testGenotype4'});
        });

        after(async () => {
            await pj.disconnect();
        });

        it(`should find genotypes, referenced generations and families`, async () => {
            let genotypes = await pj.Genotype.find();

            genotypes.should.containDeep(
                {
                    'found': 4,
                    'remaining': 0,
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
                        },
                        '4': {
                            'genotypeId': 4,
                            'genotypeName': 'testGenotype4',
                            'generationId': 4,
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
                            'generationParents': [],
                            'familyId': 2
                        },
                        '4': {
                            'generationId': 4,
                            'generationName': 'generationWithParents',
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
            helperFunctions
                .allGenotypesShouldHaveCreatedAtAndModifiedAt(genotypes);
            helperFunctions
                .allGenerationsShouldHaveCreatedAtAndModifiedAt(genotypes);
            helperFunctions
                .allFamiliesShouldHaveCreatedAtAndModifiedAt(genotypes);
        });

        it(`should not have an empty families property object if familyName is NOT in options.attributes`, async () => {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['familyId', 'generationName']
                }
            );

            should(genotypes.families).be.undefined();
        });

        it(`should not have an empty generations property object if not generationName is in options.attributes`, async () => {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['familyId']
                }
            );

            should(genotypes.generations).be.undefined();
        });

        it(`should skip x genotypes specified with options.offset and limit the count of results to option.limit`, async () => {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['genotypeName'],
                    'limit': 3,
                    'offset': 2
                }
            );

            genotypes.should.deepEqual({
                'found': 4,
                'remaining': 0,
                'genotypes': {
                    '3': {
                        'genotypeId': 3,
                        'genotypeName': 'testGenotype3',
                        'generationId': 3,
                        'familyId': 2
                    },
                    '4': {
                        'genotypeId': 4,
                        'genotypeName': 'testGenotype4',
                        'generationId': 4,
                        'familyId': 2
                    }
                }
            });
        });

        it(`should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly (for genotype attributes)`, async () => {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['genotypeName'],
                    'where': {
                        'genotypeId': 2
                    }
                }
            );

            genotypes.should.deepEqual({
                'found': 1,
                'remaining': 0,
                'genotypes': {
                    '2': {
                        'genotypeId': 2,
                        'genotypeName': 'testGenotype2',
                        'generationId': 2,
                        'familyId': 1
                    }
                }
            });
        });

        it(`should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype attributes)`, async () => {
            let genotypes = await pj.Genotype.find({
                'attributes': ['genotypeName'],
                'where': {
                    'genotypeName': 'testGenotype3'
                }
            });

            genotypes.should.deepEqual({
                'found': 1,
                'remaining': 0,
                'genotypes': {
                    '3': {
                        'genotypeId': 3,
                        'genotypeName': 'testGenotype3',
                        'generationId': 3,
                        'familyId': 2
                    }
                }
            });
        });

        it(`should only return genotypes where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches exactly (for family attributes)`, async () => {
            let genotypes = await pj.Genotype.find({
                'attributes': ['genotypeName'],
                'where': {
                    'familyName': 'testFamily1'
                }
            });

            genotypes.should.deepEqual({
                'found': 2,
                'remaining': 0,
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
                    }
                }
            });
        });

        it(`should only return genotypes where generation has only parents specified in options.where.generationParents = [plantIdA, plantIdB]`, async () => {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['generationParents',
                        'generationName',
                        'genotypeName'],
                    'where': {'generationParents': [1,2]}
                }
            );

            genotypes.should.deepEqual(
                {
                    'found': 1,
                    'remaining': 0,
                    'genotypes': {
                        '4': {
                            'genotypeId': 4,
                            'genotypeName': 'testGenotype4',
                            'generationId': 4,
                            'familyId': 2
                        }
                    },
                    'generations': {
                        '4': {
                            'generationId': 4,
                            'generationName': 'generationWithParents',
                            'generationParents': [1, 2],
                            'familyId': 2
                        }
                    }
                }
            );
        });
    });

    describe(`genotypePlants attribute`, () => {
        let pj;

        before(async () => {
            pj = new plantJournal(':memory:');
            await pj.connect();
            await pj.Genotype.create({genotypeName: 'genotype1'});
            await pj.Plant.create({plantName: 'plant1', genotypeId: 1});
            await pj.Plant.create({plantName: 'plant2', genotypeId: 1});
            await pj.Genotype.create({genotypeName: 'genotype2'});
        });

        after(async () => {
            await pj.disconnect();
        });

        it(`should find all genotypes and the genotypePlants attribute should be an array containing all plantIds with this genotypeId`, async () => {
            let genotypes = await pj.Genotype.find({attributes: ['genotypeName', 'genotypePlants']});
            genotypes.should.containDeep(
                {
                    found: 2,
                    remaining: 0,
                    genotypes: {
                        1: {
                            genotypeName: 'genotype1',
                            genotypePlants: [1, 2]
                        },
                        2: {
                            genotypeName: 'genotype2',
                            genotypePlants: []
                        },
                    }
                }
            );
        });
    });
});
