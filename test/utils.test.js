const should = require('should');
const Utils = require('../src/utils');
const squel = require('squel');
const CONSTANTS = require('../src/constants');

describe('Utils', function() {
  describe('#deleteEmptyProperties()', function() {
    it('should mutate object to only contain non empty properties', function() {
      Utils.deleteEmptyProperties({a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}})
        .should.deepEqual({z:{a:1}});
    });
    it('should mutate object delete non empty properties defined in limitTo', function() {
      Utils.deleteEmptyProperties({a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}}, ['a', 'b', 'c'])
        .should.deepEqual({d:false, e:-1, f:1, z:{a:1}});
    })
  });

  describe('#addFamilyFromRowToReturnObject()', function() {
    it('should add family object to returnObject.families[familyId]', function() {
      let row = {'familyId': 42, 'familyName': 'testFam'};
      let returnObject = {'families': {}};
      Utils.addFamilyFromRowToReturnObject(row, returnObject, {});
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

    it('should not add family object to returnObject.families if row.familyName is not set', function() {
      let row = {'familyId': 42};
      let returnObject = {'families': {}};
      Utils.addFamilyFromRowToReturnObject(row, returnObject, {});

      returnObject.should.deepEqual(
        {
          'families': {}
        }
      );
    });

    it('should add family object to returnObject.familys[familyId] if row.familyName is not defined but forceAdd=true', function() {
      let row = {'familyId': 42};
      let returnObject = {'families': {}};
      Utils.addFamilyFromRowToReturnObject(row, returnObject, {}, true);
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

  describe('#addGenerationFromRowToReturnObject()', function() {
    it('should add generation object to returnObject.generations[generationId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'generationParents': '13,14'};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});

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

    it('should not add generation object to returnObject.generations[generationId] if the only generation* field which is set is row.generationId', function() {
      let row = {'familyId': 42, 'generationId': 13};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});
      returnObject.should.deepEqual({'families': {}, 'generations': {}});
    });

    it('should add generation object to returnObject.generations[generationId] if row.generationName is not defined but forceAdd=true', function() {
      let row = {'familyId': 42, 'generationId': 13};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {}, true);
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

    it('should add generation object to returnObject... if row.generationParents is defined and it should split it and cast to integers', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationParents': '27,100'};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});
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

    it('should set returnObject.generationParents = [] if row.generationParents = null', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationParents': null};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});
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

  describe('#addGenotypeFromRowToReturnObject', function() {
    it('should add genotype object to returnObject.genotypes[genotypeId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337, 'genotypeName': 'testpheno'};
      let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}};
      Utils.addGenotypeFromRowToReturnObject(row, returnObject, {});

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

    it('should not add genotype object to returnObject.genotypes[genotypeId] if row.genotypeName is not defined', function() {
        let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337};
        let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}};
        Utils.addGenotypeFromRowToReturnObject(row, returnObject, {});
        returnObject.should.deepEqual({'families': {}, 'generations': {}, 'genotypes': {}});
    });

    it('should add genotype object to returnObject.genotypes[genotypeId] if row.genotypeName is not defined but forceAdd=true', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337};
      let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}};
      Utils.addGenotypeFromRowToReturnObject(row, returnObject, {}, true);
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

  describe('#addPlantFromRowToReturnObject()', function() {
    it('should add plant object to returnObject.plants[plantId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337, 'genotypeName': 'testpheno', 'plantId': 12, 'plantName': 'testPlant', 'plantClonedFrom': null, 'plantSex': 'male'};
      let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}, 'plants': {}};
      Utils.addPlantFromRowToReturnObject(row, returnObject, {});

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
              'familyId': 42
            }
          }
        }
      );
    });

    it('should not add plant object to returnObject.plants[plantId] if only id fields (plantId, generationId...) are defined (and forceAdd=false)', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337, 'genotypeName': 'testpheno', 'plantId': 12};
      let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}, 'plants': {}};
      Utils.addPlantFromRowToReturnObject(row, returnObject, {});
      returnObject.should.deepEqual({'families': {}, 'generations': {}, 'genotypes': {}, 'plants': {}});
    });

    it('should add plant object to returnObject.plants[plantId] if row.plantName is not defined but forceAdd=true', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'genotypeId': 1337, 'plantId': 12};
      let returnObject = {'families': {}, 'generations': {}, 'genotypes': {}, 'plants': {}};
      Utils.addPlantFromRowToReturnObject(row, returnObject, {}, true);
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
              'familyId': 42
            }
          }
        }
      );
    });
  });

  describe('#addFoundAndRemainingFromCountToReturnObject()', function() {
    it('should calculate remaining count and add with found to returnObject', function() {
      let returnObject = {};
      let options = {offset: 42};
      let count = {'count': 130};
      Utils.addFoundAndRemainingFromCountToReturnObject(count, 5, returnObject, options);
      returnObject.should.deepEqual({'found': 130, 'remaining': 83});
    });

    it('should calculate remaining count if options.offset is not defined and add with found to returnObject', function() {
      let returnObject = {};
      let options = {};
      let count = {'count': 42};
      Utils.addFoundAndRemainingFromCountToReturnObject(count, 30, returnObject, options);
      returnObject.should.deepEqual({'found': 42, 'remaining': 12});
    });
  });
});
