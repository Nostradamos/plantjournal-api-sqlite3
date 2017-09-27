/* eslint-env node, mocha */
'use strict';

const should = require('should');
const sqlite = require('sqlite');

const Utils = require('../../../src/utils/utils');

describe(`utils/utils`, () => {
    describe(`#deleteEmptyProperties()`, () => {
        it(`should mutate object to only contain non empty properties`, () => {
            Utils.deleteEmptyProperties(
                {a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}})
                .should.deepEqual({z:{a:1}});
        });

        it(`should mutate object delete non empty properties defined in  limitTo`, () => {
            Utils.deleteEmptyProperties(
                {a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}},
                ['a', 'b', 'c'])
                .should.deepEqual({d:false, e:-1, f:1, z:{a:1}});
        });
    });

    describe(`#addFamilyFromRowToReturnObject()`, () => {
        it(`should add family object to returnObject.families[familyId]`, () => {
            let row = {'familyId': 42, 'familyName': 'testFam'};
            let returnObject = {'families': {}};

            Utils.addFamilyFromRowToReturnObject(row, returnObject);
            returnObject.should.deepEqual(
                {
                    'families': {
                        '42': {
                            'familyId': 42,
                            'familyName': 'testFam'
                        }
                    }
                }
            );
        });

        it(`should not add family object to returnObject.families if  row.familyName is not set`, () => {
            let row = {'familyId': 42};
            let returnObject = {'families': {}};

            Utils.addFamilyFromRowToReturnObject(row, returnObject);

            returnObject.should.deepEqual(
                {
                    'families': {}
                }
            );
        });

        it(`should add family object to returnObject.familys[familyId] if  row.familyName is not defined but forceAdd=true`, () => {
            let row = {'familyId': 42};
            let returnObject = {'families': {}};

            Utils.addFamilyFromRowToReturnObject(
                row, returnObject, true);
            returnObject.should.deepEqual(
                {
                    'families': {
                        '42': {
                            'familyId': 42,
                        }
                    },
                }
            );
        });
    });

    describe(`#addGenerationFromRowToReturnObject()`, () => {
        it(`should add generation object to  returnObject.generations[generationId]`, () => {
            let row = {
                'familyId': 42, 'generationId': 13,
                'generationName': 'F4', 'generationParents': '13,14'};
            let returnObject = {'families': {}, 'generations': {}};

            Utils.addGenerationFromRowToReturnObject(row, returnObject);

            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {
                        '13': {
                            'generationId': 13,
                            'generationName': 'F4',
                            'generationParents': [13,14],
                            'familyId': 42
                        }
                    }
                }
            );
        });

        it(`should not add generation object to  returnObject.generations[generationId] if the only generation*  field which is set is row.generationId`, () => {
            let row = {'familyId': 42, 'generationId': 13};
            let returnObject = {'families': {}, 'generations': {}};

            Utils.addGenerationFromRowToReturnObject(row, returnObject);
            returnObject.should.deepEqual(
                {'families': {}, 'generations': {}});
        });

        it(`should add generation object to returnObject.generations[generationId] if row.generationName is  defined but forceAdd=true`, () => {
            let row = {'familyId': 42, 'generationId': 13};
            let returnObject = {'families': {}, 'generations': {}};

            Utils.addGenerationFromRowToReturnObject(
                row, returnObject, true);
            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {
                        '13': {
                            'generationId': 13,
                            'familyId': 42
                        }
                    },
                }
            );
        });

        it(`should add generation object to returnObject... if  row.generationParents is defined and it should split it and cast to integers`, () => {
            let row = {
                'familyId': 42, 'generationId': 13,
                'generationParents': '27,100'};
            let returnObject = {'families': {}, 'generations': {}};

            Utils.addGenerationFromRowToReturnObject(row, returnObject);
            returnObject.generations.should.deepEqual(
                {
                    '13': {
                        'generationId': 13,
                        'generationParents': [27, 100],
                        'familyId': 42
                    }
                }
            );
        });

        it(`should set returnObject.generationParents = [] if  row.generationParents = null`, () => {
            let row = {
                'familyId': 42, 'generationId': 13,
                'generationParents': null};
            let returnObject = {'families': {}, 'generations': {}};

            Utils.addGenerationFromRowToReturnObject(row, returnObject);
            returnObject.generations.should.deepEqual(
                {
                    '13': {
                        'generationId': 13,
                        'generationParents': [],
                        'familyId': 42
                    }
                }
            );
        });
    });

    describe(`#addGenotypeFromRowToReturnObject`, () => {
        it(`should add genotype object to returnObject.genotypes[genotypeId]`, () => {
            let row = {
                'familyId': 42, 'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337, 'genotypeName': 'testpheno'};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {}};

            Utils.addGenotypeFromRowToReturnObject(row, returnObject);

            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {},
                    'genotypes': {
                        '1337': {
                            'genotypeId': 1337,
                            'genotypeName': 'testpheno',
                            'generationId': 13,
                            'familyId': 42
                        }
                    }
                }
            );
        });

        it(`should not add genotype object to  returnObject.genotypes[genotypeId] if row.genotypeName is not  defined`, () => {
            let row = {
                'familyId': 42, 'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {}};

            Utils.addGenotypeFromRowToReturnObject(row, returnObject);
            returnObject.should.deepEqual(
                {'families': {}, 'generations': {}, 'genotypes': {}});
        });

        it(`should add genotype object to returnObject.genotypes[genotypeId] if row.genotypeName is not defined but forceAdd=true`, () => {
            let row = {
                'familyId': 42, 'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {}};

            Utils.addGenotypeFromRowToReturnObject(
                row, returnObject, true);
            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {},
                    'genotypes': {
                        '1337': {
                            'genotypeId': 1337,
                            'generationId': 13,
                            'familyId': 42
                        }
                    }
                }
            );
        });
    });

    describe(`#addPlantFromRowToReturnObject()`, () => {
        it(`should add plant object to returnObject.plants[plantId]`, () => {
            let row = {
                'familyId': 42,
                'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337, 'genotypeName': 'testpheno',
                'plantId': 12, 'plantName': 'testPlant',
                'plantClonedFrom': null, 'plantSex': 'male',
                'mediumId': 11, 'mediumName': 'blubb',
                'environmentId': 3, 'environmentName': 'xyz'};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}};

            Utils.addPlantFromRowToReturnObject(row, returnObject);

            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {},
                    'genotypes': {},
                    'plants': {
                        '12': {
                            'plantId': 12,
                            'plantName': 'testPlant',
                            'plantClonedFrom': null,
                            'plantSex': 'male',
                            'genotypeId': 1337,
                            'generationId': 13,
                            'familyId': 42,
                            'mediumId': 11,
                            'environmentId': 3
                        }
                    }
                }
            );
        });

        it(`should not add plant object to returnObject.plants[plantId] if only id attributes (plantId, generationId...) are defined  (and forceAdd=false)`, () => {
            let row = {
                'familyId': 42, 'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337, 'genotypeName': 'testpheno',
                'plantId': 12};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}};

            Utils.addPlantFromRowToReturnObject(row, returnObject);
            returnObject.should.deepEqual({
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}});
        });

        it(`should add plant object to returnObject.plants[plantId] if  row.plantName is not defined but forceAdd=true`, () => {
            let row = {
                'familyId': 42, 'generationId': 13, 'generationName': 'F4',
                'genotypeId': 1337, 'plantId': 12, 'mediumId': 24,
                'environmentId': 11};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}};

            Utils.addPlantFromRowToReturnObject(row, returnObject, true);
            returnObject.should.deepEqual(
                {
                    'families': {},
                    'generations': {},
                    'genotypes': {},
                    'plants': {
                        '12': {
                            'plantId': 12,
                            'genotypeId': 1337,
                            'generationId': 13,
                            'familyId': 42,
                            'mediumId': 24,
                            'environmentId': 11
                        }
                    }
                }
            );
        });

        it(`should set environmentId:null if row.environmentId is not defined`, () => {
            let row = {
                'familyId': 42,
                'generationId': 13,
                'genotypeId': 1337,
                'plantId': 12, 'plantName': 'testPlant',
                'mediumId': 24};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}};

            Utils.addPlantFromRowToReturnObject(row, returnObject);
            returnObject.plants.should.deepEqual(
                {
                    '12': {
                        'plantId': 12,
                        'plantName': 'testPlant',
                        'genotypeId': 1337,
                        'generationId': 13,
                        'familyId': 42,
                        'mediumId': 24,
                        'environmentId': null
                    }
                }
            );
        });

        it(`should set mediumId: null if row.mediumId is not defined`, () => {
            let row = {
                'familyId': 42,
                'generationId': 13,
                'genotypeId': 1337,
                'plantId': 12, 'plantName': 'testPlant'};
            let returnObject = {
                'families': {}, 'generations': {}, 'genotypes': {},
                'plants': {}};

            Utils.addPlantFromRowToReturnObject(row, returnObject);
            returnObject.plants.should.deepEqual(
                {
                    '12': {
                        'plantId': 12,
                        'plantName': 'testPlant',
                        'genotypeId': 1337,
                        'generationId': 13,
                        'familyId': 42,
                        'mediumId': null,
                        'environmentId': null
                    }
                }
            );
        });
    });

    describe(`#addFoundAndRemainingFromCountToReturnObject()`, () => {
        it(`should calculate remaining count and add with found to returnObject`, () => {
            let returnObject = {};
            let options = {offset: 42};
            let count = {'count': 130};

            Utils.addFoundAndRemainingFromCountToReturnObject(
                count, 5, returnObject, options);
            returnObject.should.deepEqual({'found': 130, 'remaining': 83});
        });

        it(`should calculate remaining count if options.offset is not defined and add with found to returnObject`, () => {
            let returnObject = {};
            let options = {};
            let count = {'count': 42};

            Utils.addFoundAndRemainingFromCountToReturnObject(
                count, 30, returnObject, options);
            returnObject.should.deepEqual({'found': 42, 'remaining': 12});
        });
    });

    describe(`#throwErrorIfNotConnected()`, () => {
        it(`should throw error if sqlite is not connected`, async () => {
            if(sqlite.driver !== null) {
                try {
                    await sqlite.close();
                } catch(err) {
                    null;
                }
            }
            should(() => Utils.throwErrorIfNotConnected())
                .throw('plantJournal is not connected to database.');
        });

        it(`should not throw error if sqlite is connected`, async () => {
            await sqlite.open(':memory:');
            Utils.throwErrorIfNotConnected();
        });
    });

    describe(`#hasToBeIntArray()`, () => {
        it(`should throw error if object[property] is not an integer array`, () => {
            let toTest = [
                {foo: null},
                {foo: 1},
                {foo: [1,2,'4']},
            ];

            for (let tt of toTest) {
                should(() => Utils.hasToBeIntArray(tt, 'foo', 'obj'))
                    .throw('obj.foo has to be an array of integers');
            }
        });

        it(`should NOT throw an error if object[property] is an integer array`, () => {
            Utils.hasToBeIntArray({foo: [-1,4,15]}, 'foo', 'obj');
        });

        it(`should NOT throw an error if object[property] is undefined`, () => {
            Utils.hasToBeIntArray({}, 'foo', 'obj');
        });
    });

    describe(`#hasToBeIntOrNull()`, () => {
        it(`should throw error if object[property] is not an integer`, () => {
            should(() => Utils.hasToBeIntOrNull({foo: '123'}, 'foo', 'obj'))
                .throw('obj.foo has to be an integer or null');
        });

        it(`should NOT throw error if object[property] is undefined`, () => {
            should(() => Utils.hasToBeIntOrNull({}, 'foo', 'obj'));
        });

        it(`should NOT throw error if object[property] is null`, () => {
            Utils.hasToBeIntOrNull({foo: null}, 'foo', 'obj');
        });

        it(`should NOT throw error if object[property] is integer`, () => {
            Utils.hasToBeIntOrNull({foo: 42}, 'foo', 'obj');
        });
    });
});
