/* eslint-env node, mocha */
'use strict';

const should = require('should');

const plantJournal = require('../../src/pj');

const helper_functions = require('../helper-functions');

describe('Genotype()', function() {
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
            await pj.Genotype.create({generationId: 1, genotypeName: 'testGenotype1'});
            await pj.Genotype.create({generationId: 2, genotypeName: 'testGenotype2'});
            await pj.Genotype.create({generationId: 3, genotypeName: 'testGenotype3'});
            await pj.Plant.create({genotypeId: 1, plantName: 'testPlant1'});
            await pj.Plant.create({genotypeId: 2, plantName: 'testPlant2'});
            await pj.Generation.create({familyId: 2, generationName: 'generationWithParents', generationParents: [1,2]});
            await pj.Genotype.create({generationId: 4, genotypeName: 'testGenotype4'});
        });

        it('should find genotypes, referenced generations and families', async function() {
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
            helper_functions
                .allGenotypesShouldHaveCreatedAtAndModifiedAtFields(genotypes);
            helper_functions
                .allGenerationsShouldHaveCreatedAtAndModifiedAtFields(genotypes);
            helper_functions
                .allFamiliesShouldHaveCreatedAtAndModifiedAtFields(genotypes);
        });

        it('should not have an empty families property object if familyName is NOT in options.attributes', async function() {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['familyId', 'generationName']
                }
            );
            should(genotypes.families).be.undefined();
        });

        it('should not have an empty generations property object if not generationName is in options.attributes', async function() {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['familyId']
                }
            );
            should(genotypes.generations).be.undefined();
        });

        it('should skip x genotypes specified with options.offset and limit the count of results to option.limit', async function() {
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

        it('should only return genotypes filter options.filter.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches exactly (for genotype attributes)', async function() {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['genotypeName'],
                    'filter': {
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

        it('should only return genotypes filter options.filter.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly (for genotype attributes)', async function() {
            let genotypes = await pj.Genotype.find({
                'attributes': ['genotypeName'],
                'filter': {
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

        it('should only return genotypes filter options.filter.ALLOWEDATTRIBUTENAME = SOMESTRING matches exactly (for family attributes)', async function() {
            let genotypes = await pj.Genotype.find({
                'attributes': ['genotypeName'],
                'filter': {
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

        it('should only return genotypes filter generation has only parents specified in options.filter.generationParents = [plantIdA, plantIdB]', async function() {
            let genotypes = await pj.Genotype.find(
                {
                    'attributes': ['generationParents', 'generationName', 'genotypeName'],
                    'filter': {'generationParents': [1,2]}
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

        after(async function() {
            await pj.disconnect();
        });
    });
});
