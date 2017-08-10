/* eslint-env node, mocha */
'use strict';

const should = require('should');

const squel = require('squel');

const QueryUtilsApplyFilter = require('../src/utils-query-apply-criteria-filter');


describe('src/utils-query-apply-criteria-filter', function() {
    describe('#QueryUtilsApplyCriteriaFilter() - errors', function() {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        it('should throw error if unknown logical operator is used', function() {
            should(
                () => {
                    QueryUtilsApplyFilter
                    (
                        q,
                        ['generationId', 'generationName'],
                        {'filter': {'$nand': {'generationId': 'a'}}}
                    );
                }
            ).throw('Illegal attribute or unknown logical operator: $nand');
        });

        it('should throw error if attribute is not in allowedFields', function() {
            should(
                () => QueryUtilsApplyFilter(q, [], {filter: {'generationName': 'testGenerationName', 'generationParents': [1,2]}})
            ).throw('Illegal attribute or unknown logical operator: generationName');
        });

        it('should throw error if unknown relational operator is used', function() {
            should(
                () => QueryUtilsApplyFilter(q, ['generationName'], {filter: {'generationName': {'$foo': 'bar'}}})
            ).throw('Unknown relational operator: $foo');
        });
    });

    describe('#QueryUtilsApplyCriteriaFilter() - boolean operators', function() {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        it('should do AND conjunction for $and', function() {
            let criteria = {
                'filter': {'$and': {'generationId': 'a', 'generationName': 'b'}}
            };

            QueryUtilsApplyFilter(q, ['generationId', 'generationName'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b')`
            );
        });

        it('should do OR conjunction for $or', function() {
            let criteria = {
                'filter': {'$or': {'generationId': 'a', 'generationName': 'b'}}
            };

            QueryUtilsApplyFilter(q, ['generationId', 'generationName'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b')`
            );
        });

        it('should do AND conjunction for nested $and', function() {

            let criteria = {
                'filter': {'generationId': 'a', '$and': {'generationName': 'b', '$and' : {'familyId': 'c'}}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunction for nested $and', function() {

            let criteria = {
                'filter': {'generationId': 'a', '$or': {'generationName': 'b', '$or' : {'familyId': 'c'}}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b' OR 'families'.'familyId' = 'c')`
            );
        });

        it('should do mixed AND/OR conjunction for nested and mixed $and/$or', function() {

            let criteria = {
                'filter': {'generationId': 'a', '$or': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do AND sub expression (=>AND (..)) for $and()', function() {

            let criteria = {
                'filter': {'$and()': {'generationId': 'a', '$and': {'generationName': 'b'}}, '$or()': {'generationId': 'c', '$and': {'generationName': 'd'}}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE (('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b') OR ('generations'.'generationId' = 'c' AND 'generations'.'generationName' = 'd'))`
            );

        });

        it('should do OR sub expression (=>OR (..)) for $or()', function() {

            let criteria = {
                'filter': {'generationId': 'a', '$or()': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR ('generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c'))`
            );
        });

        it('should do AND conjunction for dicts if it\'s not a child of $and/$or..', function() {

            let criteria = {
                'filter': {'generationId': 'a', 'familyId': 'c'}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunction for arrays if it\'s not a child of $and/$or..', function() {

            let criteria = {
                'filter': [{'generationId': 'a'}, {'familyId': 'c'}]
            };

            QueryUtilsApplyFilter(q, ['generationId', 'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
            );
        });

        it('should do AND conjunctions for arrays if it\'s a child of $and', function() {

            let criteria = {
                'filter': {'generationName': 'b', '$and':[{'generationId': 'a'}, {'familyId': 'c'}]}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' AND 'generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunctions for dicts if it\'s a child of $or', function() {

            let criteria = {
                'filter': {'generationName': 'b', '$or': {'generationId': 'a', 'familyId': 'c'}}
            };

            QueryUtilsApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' OR 'generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
            );
        });

    });

    describe('#apply-filter() - binary operators', function() {
        let q;

        beforeEach(function() {
            q = squel.select().from('test');
        });

        it('should do an `=` (equals) operation for $eq', function() {

            let criteria = {
                'filter': {'generationName': {'$eq': 'foo'}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
            );
        });

        it('should do an `=` (equals) operation if attribute value is string', function() {

            let criteria = {
                'filter': {'generationName': 'foo'}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
            );
        });

        it('should do an `=` (equals) operation if attribute value is integer', function() {

            let criteria = {
                'filter': {'generationName': {'$eq': 1}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 1)`
            );
        });

        it('should do an `!=` (not equals) operation for $neq', function() {

            let criteria = {
                'filter': {'generationName': {'$neq': 'foo'}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' != 'foo')`
            );
        });

        it('should do `LIKE` operation for $like', function() {

            let criteria = {
                'filter': {'generationName': {'$like': 'foo_'}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' LIKE 'foo_')`
            );
        });

        it('should do `NOT LIKE` operation for $nlike', function() {

            let criteria = {
                'filter': {'generationName': {'$nlike': 'foo_'}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' NOT LIKE 'foo_')`
            );
        });

        it('should do `>` operation for $gt', function() {

            let criteria = {
                'filter': {'generationId': {'$gt': 5}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' > 5)`
            );
        });

        it('should do `>=` operation for $gte', function() {

            let criteria = {
                'filter': {'generationId': {'$gte': 5}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' >= 5)`
            );
        });

        it('should do `<` operation for $lt', function() {

            let criteria = {
                'filter': {'generationId': {'$lt': 5}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' < 5)`
            );
        });

        it('should do `<=` operation for $lte', function() {

            let criteria = {
                'filter': {'generationId': {'$lte': 5}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' <= 5)`
            );
        });

        it('should do `IN` operation for $in', function() {

            let criteria = {
                'filter': {'generationId': {'$in': [5, 6]}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
            );
        });

        it('should do `IN` operation if attribute value is array', function() {

            let criteria = {
                'filter': {'generationId': [5, 6]}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
            );
        });

        it('should do `NOT IN` operation for $nin', function() {

            let criteria = {
                'filter': {'generationId': {'$nin': [5, 6]}}
            };

            QueryUtilsApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' NOT IN (5, 6))`
            );
        });

        it('should be possible to combine multiple operators on same attribute', function() {

            let criteria = {
                'filter': {'generationName': {'$neq': 'foo', '$eq': 'bar'}}
            };

            QueryUtilsApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' != 'foo' AND 'generations'.'generationName' = 'bar')`
            );
        });
    });

    describe('#apply-filter() - old tests (general)', function() {
        let q;

        beforeEach(function() {
            q = squel.select().from('test');
        });

        it('should not do anything if options.filter is not an plainObject', function() {
            QueryUtilsApplyFilter(q, [], {});
            q.toString().should.eql('SELECT * FROM test');
        });

        it('should set WHERE (translated)field = fieldValue if options.filter[field] = fieldValue is an integer and correctly translate field to database.databasefield', function() {
            QueryUtilsApplyFilter(q, ['familyId'], {filter: {'familyId': 42}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('families'.'familyId' = 42)`);
        });

        it('should set WHERE (translated)field = "fieldValue" if options.filter[field] = fieldValue is a string', function() {
            QueryUtilsApplyFilter(q, ['generationName'], {filter: {'generationName': 'testGenerationName'}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationName' = 'testGenerationName')`);
        });

        it('should set WHERE generationId IN (SELECT generations.generationId...WHERE plantId=parentIdA OR plantId=parentIdB...HAVING count(plantId)=2) if options.filter.generationParents = [parentIdA, parentIdB] is an array', function() {
            QueryUtilsApplyFilter(q, ['generationParents'], {filter: {'generationParents': [42,43]}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (42, 43)) GROUP BY generation_parents.generationId HAVING (count(generation_parents.plantId) = 2)))`);
        });

        it('should do nothing if options.filter key is valid but value is something we don\'t know how to handle (for field !== generationParents)', function() {
            QueryUtilsApplyFilter(q, ['generationName'], {filter: {'generationName': function(){}}});
            q.toString().should.eql(`SELECT * FROM test`);
        });

        it('should do nothing if options.filter key is valid but value is something we don\'t know how to handle (for field === generationParents)', function() {
            QueryUtilsApplyFilter(q, ['generationParents'], {filter: {'generationParents': function(){}}});
            q.toString().should.eql(`SELECT * FROM test`);
        });
    });

    //describe('#apply-filter() - binary operators for generationParents', function() {
    //    it('should do ');
    //});
});
