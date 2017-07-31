const should = require('should');

const squel = require('squel');

const applyFilter = require('../src/apply-filter');


describe('src/apply-filter', function() {
  describe('#apply-filter() - boolean operators', function() {
    it('should do AND conjunction for $and', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'$and': {'generationId': 'a', 'generationName': 'b'}}
      }
      applyFilter(query, ['generationId', 'generationName'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b')`
      );
    });

    it('should do OR conjunction for $or', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'$or': {'generationId': 'a', 'generationName': 'b'}}
      }
      applyFilter(query, ['generationId', 'generationName'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b')`
      );
    });

    it('should do AND conjunction for nested $and', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationId': 'a', '$and': {'generationName': 'b', '$and' : {'familyId': 'c'}}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b' AND 'families'.'familyId' = 'c')`
      );
    });

    it('should do OR conjunction for nested $and', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationId': 'a', '$or': {'generationName': 'b', '$or' : {'familyId': 'c'}}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b' OR 'families'.'familyId' = 'c')`
      );
    });

    it('should do mixed AND/OR conjunction for nested and mixed $and/$or', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationId': 'a', '$or': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c')`
      );
    });

    it('should do AND sub expression (=>AND (..)) for $and()', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'$and()': {'generationId': 'a', '$and': {'generationName': 'b'}}, '$or()': {'generationId': 'c', '$and': {'generationName': 'd'}}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE (('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b') OR ('generations'.'generationId' = 'c' AND 'generations'.'generationName' = 'd'))`
      );

    });

    it('should do OR sub expression (=>OR (..)) for $or()', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationId': 'a', '$or()': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR ('generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c'))`
      );
    });

    it('should do AND conjunction for dicts if it\'s not a child of $and/$or..', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationId': 'a', 'familyId': 'c'}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
      );
    });

    it('should do OR conjunction for arrays if it\'s not a child of $and/$or..', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': [{'generationId': 'a'}, {'familyId': 'c'}]
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
      );
    });

    it('should do AND conjunctions for arrays if it\'s a child of $and', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationName': 'b', '$and':[{'generationId': 'a'}, {'familyId': 'c'}]}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' AND 'generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
      );
    });

    it('should do OR conjunctions for dicts if it\'s a child of $or', function() {
      let query = squel.select().from("test");
      let criteria = {
        'filter': {'generationName': 'b', '$or': {'generationId': 'a', 'familyId': 'c'}}
      }
      applyFilter(query, ['generationId', 'generationName', 'familyId'], criteria);

      query.toString().should.eql(
        `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' OR 'generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
      );
    });
    
  });
});
