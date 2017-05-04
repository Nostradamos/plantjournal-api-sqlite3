const should = require('should');
const Utils = require('../lib/utils');
const squel = require('squel');
const Constants = require('../lib/constants');

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
      Utils._setFields({'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test'])
        .should.eql(['families.familyName']);
    });
    it('should return all field aliases if fieldsToSelect is empty', function() {
      Utils._setFields({'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, [])
        .should.eql(['genotypes.genotypeName', 'generations.generationName', 'families.familyName']);
    });
  });

  describe('#setFields()', function() {
    it('should set query.fields() with the return value of _setFields()', function() {
      let q = squel.select().from('test');
      Utils.setFields(q, {'genotypeName': 'genotypes.genotypeName', 'generationName': 'generations.generationName', 'familyName': 'families.familyName'}, ['familyName', 'test']);
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

  describe('#setWhere()', function() {
    let q;
    beforeEach(function() {
      q = squel.select().from('test');
    });

    it('should not do anything if options.where is not an plainObject', function() {
      Utils.setWhere(q, [], {});
      q.toString().should.eql('SELECT * FROM test');
    });

    it('should set WHERE (translated)field = fieldValue if options.where[field] = fieldValue is an integer and correctly translate field to database.databasefield', function() {
      Utils.setWhere(q, ['familyId'], {where: {'familyId': 42}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('families'.'familyId' = 42)`);
    });

    it('should set WHERE (translated)field = "fieldValue" if options.where[field] = fieldValue is a string', function() {
      Utils.setWhere(q, ['generationName'], {where: {'generationName': 'testGenerationName'}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationName' = 'testGenerationName')`);
    });

    it('should not set WHERE if field is not in allowedFields', function() {
      Utils.setWhere(q, [], {where: {'generationName': 'testGenerationName', 'generationParents': [1,2]}});
      q.toString().should.eql('SELECT * FROM test');
    });

    it('should set WHERE generationId IN (SELECT generations.generationId...WHERE plantId=parentIdA OR plantId=parentIdB...HAVING count(plantId)=2) if options.where.generationParents = [parentIdA, parentIdB] is an array', function() {
      Utils.setWhere(q, ['generationParents'], {where: {'generationParents': [42,43]}});
      q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN ((SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE (generation_parents.plantId = 42 OR generation_parents.plantId = 43) GROUP BY generation_parents.generationId HAVING (count(generation_parents.plantId) = 2))))`);
    });

    it('should do nothing if options.where key is valid but value is something we don\'t know how to handle (for field !== generationParents)', function() {
      Utils.setWhere(q, ['generationName'], {where: {'generationName': function(){}}});
      q.toString().should.eql(`SELECT * FROM test`);
    });

    it('should do nothing if options.where key is valid but value is something we don\'t know how to handle (for field === generationParents)', function() {
      Utils.setWhere(q, ['generationParents'], {where: {'generationParents': function(){}}});
      q.toString().should.eql(`SELECT * FROM test`);
    });
  });

  describe('#whichTableForField()', function() {
    it('should return "families" for any field starting with "family"', function() {
      Utils.whichTableForField('familyId').should.eql('families');
      Utils.whichTableForField('familyName').should.eql('families');
    });

    it('should return "generations" for any field starting with "generation" (except of generationParents)', function() {
      Utils.whichTableForField('generationId').should.eql('generations');
      Utils.whichTableForField('generationName').should.eql('generations');
    });

    it('should return "generation_parents" if field === "generationParents"', function() {
      Utils.whichTableForField('generationParents').should.eql('generation_parents');
    });

    it('should return "genotypes" for any field starting with "genotype"', function() {
      Utils.whichTableForField('genotypeId').should.eql('genotypes');
      Utils.whichTableForField('genotypeName').should.eql('genotypes');
    });

    it('should return "plants" for any field starting with "plant"', function() {
      Utils.whichTableForField('plantId').should.eql('plants');
      Utils.whichTableForField('plantName').should.eql('plants');
    });

    it('should throw error if can\'t resolve table', function() {
      let table;
      let catched = false;
      try {
        table = Utils.whichTableForField('blubbField');
      } catch (err) {
        catched = true;
        err.message.should.eql('cannot associate field with a table');
      }
      catched.should.be.true();
    });
  });

  describe('#leftJoinFamilies()', function() {
    it('should join `families` on familyId', function() {
      let q = squel.select().from(Constants.tableGenerations, 'generations');
      Utils.leftJoinFamilies(q);
      q.toString().should.eql('SELECT * FROM ' + Constants.tableGenerations +' `generations` LEFT JOIN ' + Constants.tableFamilies + ' `families` ON (generations.familyId = families.familyId)');
    });
  });

  describe('#leftJoinGenerations()', function() {
    it('should join `generations` and `generation_parents` on generationId', function() {
      let q = squel.select().from(Constants.tableGenotypes, 'genotypes');
      Utils.leftJoinGenerations(q);
      q.toString().should.eql('SELECT * FROM ' + Constants.tableGenotypes +' `genotypes` LEFT JOIN ' + Constants.tableGenerations + ' `generations` ON (genotypes.generationId = generations.generationId) LEFT JOIN ' + Constants.tableGenerationParents +' `generation_parents` ON (generations.generationId = generation_parents.generationId)');
    });
  });

  describe('#leftJoinGenotypes()', function () {
    it('should join `genotypes`', function() {
      let q = squel.select().from(Constants.tablePlants, 'plants');
      Utils.leftJoinGenotypes(q);
      q.toString().should.eql('SELECT * FROM ' + Constants.tablePlants +' `plants` LEFT JOIN ' + Constants.tableGenotypes + ' `genotypes` ON (plants.genotypeId = genotypes.genotypeId)');

    });
  });
});
