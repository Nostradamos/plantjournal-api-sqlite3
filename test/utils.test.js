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
});
