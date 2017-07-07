const should = require('should');
const squel = require('squel');

const CONSTANTS = require('../src/constants');
const QueryUtils = require('../src/utils-query');

describe('QueryUtils', function() {
  describe('#_setFields()', function() {
    it('should return an array of field aliases where the non field alias is specified in fieldsToSelect and ignore unknown/wrong fields', function() {
      QueryUtils._setFields({'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test'])
        .should.eql(['families.familyName']);
    });
    it('should return all field aliases if fieldsToSelect is empty', function() {
      QueryUtils._setFields({'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, [])
        .should.eql(['genotypes.genotypeName', 'generations.generationName', 'families.familyName']);
    });
  });

  describe('#setFields()', function() {
    it('should set query.fields() with the return value of _setFields()', function() {
      let q = squel.select().from('test');
      QueryUtils.setFields(q, {'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test']);
      q.toString().should.equal('SELECT families.familyName FROM test');
    })
  });

  describe('#setLimitAndOffset()', function() {
    it('should set limit(options.limit) and offset(options.offset)', function() {
      let q = squel.select().from('test');
      QueryUtils.setLimitAndOffset(q, {'limit': 42, 'offset': 13});
      q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 13');
    });
    it('should set limit(10) if options.limit is not set', function() {
      let q = squel.select().from('test');
      QueryUtils.setLimitAndOffset(q, {'offset': 13});
      q.toString().should.eql('SELECT * FROM test LIMIT 10 OFFSET 13');
    });
    it('should set offset(0) if options.offset is not set', function() {
      let q = squel.select().from('test');
      QueryUtils.setLimitAndOffset(q, {'limit': 42});
      q.toString().should.eql('SELECT * FROM test LIMIT 42');
    });
  });
  describe('#setWhere()', function() {
    let q;
    beforeEach(function() {
      q = squel.select().from('test');
    });

    it('should not do anything if options.where is not an plainObject', function() {
      QueryUtils.setWhere(q, [], {});
      q.toString().should.eql('SELECT * FROM test');
    });

    it('should set WHERE (translated)field = fieldValue if options.where[field] = fieldValue is an integer and correctly translate field to database.databasefield', function() {
      QueryUtils.setWhere(q, ['familyId'], {where: {'familyId': 42}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('families'.'familyId' = 42)`);
    });

    it('should set WHERE (translated)field = "fieldValue" if options.where[field] = fieldValue is a string', function() {
      QueryUtils.setWhere(q, ['generationName'], {where: {'generationName': 'testGenerationName'}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationName' = 'testGenerationName')`);
    });

    it('should not set WHERE if field is not in allowedFields', function() {
      QueryUtils.setWhere(q, [], {where: {'generationName': 'testGenerationName', 'generationParents': [1,2]}});
      q.toString().should.eql('SELECT * FROM test');
    });

    it('should set WHERE generationId IN (SELECT generations.generationId...WHERE plantId=parentIdA OR plantId=parentIdB...HAVING count(plantId)=2) if options.where.generationParents = [parentIdA, parentIdB] is an array', function() {
      QueryUtils.setWhere(q, ['generationParents'], {where: {'generationParents': [42,43]}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN ((SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE (generation_parents.plantId = 42 OR generation_parents.plantId = 43) GROUP BY generation_parents.generationId HAVING (count(generation_parents.plantId) = 2))))`);
    });

    it('should do nothing if options.where key is valid but value is something we don\'t know how to handle (for field !== generationParents)', function() {
      QueryUtils.setWhere(q, ['generationName'], {where: {'generationName': function(){}}});
      q.toString().should.eql(`SELECT * FROM test`);
    });

    it('should do nothing if options.where key is valid but value is something we don\'t know how to handle (for field === generationParents)', function() {
      QueryUtils.setWhere(q, ['generationParents'], {where: {'generationParents': function(){}}});
      q.toString().should.eql(`SELECT * FROM test`);
    });
  });

  describe('#getTableOfField()', function() {
    it('should return "families" for any field starting with "family"', function() {
      QueryUtils.getTableOfField('familyId').should.eql('families');
      QueryUtils.getTableOfField('familyName').should.eql('families');
    });

    it('should return "generations" for any field starting with "generation" (except of generationParents)', function() {
      QueryUtils.getTableOfField('generationId').should.eql('generations');
      QueryUtils.getTableOfField('generationName').should.eql('generations');
    });

    it('should return "generation_parents" if field === "generationParents"', function() {
      QueryUtils.getTableOfField('generationParents').should.eql('generation_parents');
    });

    it('should return "genotypes" for any field starting with "genotype"', function() {
      QueryUtils.getTableOfField('genotypeId').should.eql('genotypes');
      QueryUtils.getTableOfField('genotypeName').should.eql('genotypes');
    });

    it('should return "plants" for any field starting with "plant"', function() {
      QueryUtils.getTableOfField('plantId').should.eql('plants');
      QueryUtils.getTableOfField('plantName').should.eql('plants');
    });

    it('should throw error if can\'t resolve table', function() {
      let table;
      let catched = false;
      try {
        table = QueryUtils.getTableOfField('blubbField');
      } catch (err) {
        catched = true;
        err.message.should.eql('cannot associate field with a table');
      }
      catched.should.be.true();
    });
  });

  describe('#joinFamilies()', function() {
    it('should join `families` on familyId', function() {
      let q = squel.select().from(CONSTANTS.TABLE_GENERATIONS, 'generations');
      QueryUtils.joinFamilies(q);
      q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_GENERATIONS +' `generations` LEFT JOIN ' + CONSTANTS.TABLE_FAMILIES + ' `families` ON (generations.familyId = families.familyId)');
    });
  });

  describe('#joinGenerations()', function() {
    it('should join `generations` and `generation_parents` on generationId', function() {
      let q = squel.select().from(CONSTANTS.TABLE_GENOTYPES, 'genotypes');
      QueryUtils.joinGenerations(q);
      q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_GENOTYPES +' `genotypes` LEFT JOIN ' + CONSTANTS.TABLE_GENERATIONS + ' `generations` ON (genotypes.generationId = generations.generationId) LEFT JOIN ' + CONSTANTS.TABLE_GENERATION_PARENTS +' `generation_parents` ON (generations.generationId = generation_parents.generationId)');
    });
  });

  describe('#joinGenotypes()', function () {
    it('should join `genotypes`', function() {
      let q = squel.select().from(CONSTANTS.TABLE_PLANTS, 'plants');
      QueryUtils.joinGenotypes(q);
      q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_PLANTS +' `plants` LEFT JOIN ' + CONSTANTS.TABLE_GENOTYPES + ' `genotypes` ON (plants.genotypeId = genotypes.genotypeId)');

    });
  });
});
