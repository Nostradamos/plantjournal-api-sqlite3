const should = require('should');
const Utils = require('../lib/utils');
const squel = require('squel');

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

  describe('#_setFields()', function() {
    it('should return an array of field aliases where the non field alias is specified in fieldsToSelect and ignore unknown/wrong fields', function() {
      Utils._setFields({'phenotypeName': 'phenotypes.phenotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test'])
        .should.eql(['families.familyName']);
    });
    it('should return all field aliases if fieldsToSelect is empty', function() {
      Utils._setFields({'phenotypeName': 'phenotypes.phenotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, [])
        .should.eql(['phenotypes.phenotypeName', 'generations.generationName', 'families.familyName']);
    });
  });

  describe('#setFields()', function() {
    it('should set query.fields() with the return value of _setFields()', function() {
      let q = squel.select().from('test');
      Utils.setFields(q, {'phenotypeName': 'phenotypes.phenotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test']);
      q.toString().should.equal('SELECT families.familyName FROM test');
    })
  });

  describe('#setLimitAndOffset()', function() {
    it('should set limit(options.limit) and offset(options.offset)', function() {
      let q = squel.select().from('test');
      Utils.setLimitAndOffset(q, {'limit': 42, 'offset': 13});
      q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 13');
    });
    it('should set limit(10) if options.limit is not set', function() {
      let q = squel.select().from('test');
      Utils.setLimitAndOffset(q, {'offset': 13});
      q.toString().should.eql('SELECT * FROM test LIMIT 10 OFFSET 13');
    });
    it('should set offset(0) if options.offset is not set', function() {
      let q = squel.select().from('test');
      Utils.setLimitAndOffset(q, {'limit': 42});
      q.toString().should.eql('SELECT * FROM test LIMIT 42');
    });
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
  });

  describe('#addGenerationFromRowToReturnObject()', function() {
    it('should add generation object to returnObject.generations[generationId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4'};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});

      returnObject.should.deepEqual(
        {
          'families': {},
          'generations': {
            '13': {
              'generationId': 13,
              'generationName': 'F4',
              'familyId': 42
            }
          }
        }
      );
    });

    it('should not add generation object to returnObject.generations[generationId] if row.generationName is not defined', function() {
      let row = {'familyId': 42, 'generationId': 13};
      let returnObject = {'families': {}, 'generations': {}};
      Utils.addGenerationFromRowToReturnObject(row, returnObject, {});
      returnObject.should.deepEqual({'families': {}, 'generations': {}});
    });
  });

  describe('#addPhenotypeFromRowToReturnObject', function() {
    it('should add phenotype object to returnObject.phenotypes[phenotypeId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'phenotypeId': 1337, 'phenotypeName': 'testpheno'};
      let returnObject = {'families': {}, 'generations': {}, 'phenotypes': {}};
      Utils.addPhenotypeFromRowToReturnObject(row, returnObject, {});

      returnObject.should.deepEqual(
        {
          'families': {},
          'generations': {},
          'phenotypes': {
            '1337': {
              'phenotypeId': 1337,
              'phenotypeName': 'testpheno',
              'generationId': 13,
              'familyId': 42
            }
          }
        }
      );
    });

    it('should not add phenotype object to returnObject.phenotypes[phenotypeId] if row.phenotypeName is not defined', function() {
        let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'phenotypeId': 1337};
        let returnObject = {'families': {}, 'generations': {}, 'phenotypes': {}};
        Utils.addPhenotypeFromRowToReturnObject(row, returnObject, {});
        returnObject.should.deepEqual({'families': {}, 'generations': {}, 'phenotypes': {}});
    });
  });

  describe('#addPlantFromRowToReturnObject()', function() {
    it('should add plant object to returnObject.plants[plantId]', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'phenotypeId': 1337, 'phenotypeName': 'testpheno', 'plantId': 12, 'plantName': 'testPlant'};
      let returnObject = {'families': {}, 'generations': {}, 'phenotypes': {}, 'plants': {}};
      Utils.addPlantFromRowToReturnObject(row, returnObject, {});

      returnObject.should.deepEqual(
        {
          'families': {},
          'generations': {},
          'phenotypes': {},
          'plants': {
            '12': {
              'plantId': 12,
              'plantName': 'testPlant',
              'phenotypeId': 1337,
              'generationId': 13,
              'familyId': 42
            }
          }
        }
      );
    });

    it('should not add plant object to returnObject.plants[plantId] if row.plantName is not defined', function() {
      let row = {'familyId': 42, 'generationId': 13, 'generationName': 'F4', 'phenotypeId': 1337, 'phenotypeName': 'testpheno', 'plantId': 12};
      let returnObject = {'families': {}, 'generations': {}, 'phenotypes': {}, 'plants': {}};
      Utils.addPlantFromRowToReturnObject(row, returnObject, {});
      returnObject.should.deepEqual({'families': {}, 'generations': {}, 'phenotypes': {}, 'plants': {}});
    });
  });
});
