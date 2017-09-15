/* eslint-env node, mocha */
'use strict';

const should = require('should');

const squel = require('squel');

const UtilsQueryApplyFilter = require('../../src/utils-query-apply-criteria-filter');


describe('src/utils-query-apply-criteria-filter', () => {
    describe('#UtilsQueryApplyCriteriaFilter() - errors', () => {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        it('should throw error if unknown logical operator is used', () => {
            should(
                () => {
                    UtilsQueryApplyFilter
                    (
                        q,
                        ['generationId', 'generationName'],
                        {'filter': {'$nand': {'generationId': 'a'}}}
                    );
                }
            ).throw('Illegal attribute or unknown logical operator: $nand');
        });

        it('should throw error if attribute is not in allowedFields', () => {
            should(
                () => UtilsQueryApplyFilter(q, [], {filter: {'generationName': 'testGenerationName', 'generationParents': [1,2]}})
            ).throw('Illegal attribute or unknown logical operator: generationName');
        });
    });

    describe('#UtilsQueryApplyCriteriaFilter() - boolean operators', () => {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        it('should do AND conjunction for $and', () => {
            let criteria = {
                'filter': {'$and': {'generationId': 'a', 'generationName': 'b'}}
            };

            UtilsQueryApplyFilter(q, ['generationId', 'generationName'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b')`
            );
        });

        it('should do OR conjunction for $or', () => {
            let criteria = {
                'filter': {'$or': {'generationId': 'a', 'generationName': 'b'}}
            };

            UtilsQueryApplyFilter(q, ['generationId', 'generationName'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b')`
            );
        });

        it('should do AND conjunction for nested $and', () => {

            let criteria = {
                'filter': {'generationId': 'a', '$and': {'generationName': 'b', '$and' : {'familyId': 'c'}}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunction for nested $and', () => {

            let criteria = {
                'filter': {'generationId': 'a', '$or': {'generationName': 'b', '$or' : {'familyId': 'c'}}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b' OR 'families'.'familyId' = 'c')`
            );
        });

        it('should do mixed AND/OR conjunction for nested and mixed $and/$or', () => {

            let criteria = {
                'filter': {'generationId': 'a', '$or': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do AND sub expression (=>AND (..)) for $and()', () => {

            let criteria = {
                'filter': {'$and()': {'generationId': 'a', '$and': {'generationName': 'b'}}, '$or()': {'generationId': 'c', '$and': {'generationName': 'd'}}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE (('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b') OR ('generations'.'generationId' = 'c' AND 'generations'.'generationName' = 'd'))`
            );

        });

        it('should do OR sub expression (=>OR (..)) for $or()', () => {

            let criteria = {
                'filter': {'generationId': 'a', '$or()': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR ('generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c'))`
            );
        });

        it('should do AND conjunction for dicts if it\'s not a child of $and/$or..', () => {

            let criteria = {
                'filter': {'generationId': 'a', 'familyId': 'c'}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunction for arrays if it\'s not a child of $and/$or..', () => {

            let criteria = {
                'filter': [{'generationId': 'a'}, {'familyId': 'c'}]
            };

            UtilsQueryApplyFilter(q, ['generationId', 'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
            );
        });

        it('should do AND conjunctions for arrays if it\'s a child of $and', () => {

            let criteria = {
                'filter': {'generationName': 'b', '$and':[{'generationId': 'a'}, {'familyId': 'c'}]}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' AND 'generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
            );
        });

        it('should do OR conjunctions for dicts if it\'s a child of $or', () => {

            let criteria = {
                'filter': {'generationName': 'b', '$or': {'generationId': 'a', 'familyId': 'c'}}
            };

            UtilsQueryApplyFilter(q, ['generationId',
                'generationName',
                'familyId'], criteria);

            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' OR 'generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
            );
        });

    });

    describe('#apply-filter() - binary operators', () => {
        let q;

        beforeEach(() => {
            q = squel.select().from('test');
        });

        it('should do an `=` (equals) operation for $eq', () => {
            let criteria = {
                'filter': {'generationName': {'$eq': 'foo'}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
            );
        });

        it('should do an `=` (equals) operation if attribute value is string', () => {
            let criteria = {
                'filter': {'generationName': 'foo'}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
            );
        });

        it('should do an `=` (equals) operation if attribute value is integer', () => {
            let criteria = {
                'filter': {'generationName': 1}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 1)`
            );
        });

        it('should do an `IS NULL` (equals) operation if attribute value is null', () => {
            let criteria = {
                'filter': {'generationName': null}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' IS NULL)`
            );
        });

        it('should do an `IS NULL` (equals) operation if $eq value is null', () => {
            let criteria = {
                'filter': {'generationName': {'$eq': null}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' IS NULL)`
            );
        });


        it('should do an `!=` (not equals) operation for $neq', () => {
            let criteria = {
                'filter': {'generationName': {'$neq': 'foo'}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' != 'foo')`
            );
        });

        it('should do an `IS NOT NULL` (not equals) operation for $neq: null', () => {
            let criteria = {
                'filter': {'generationName': {'$neq': null}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' IS NOT NULL)`
            );
        });

        it('should do `LIKE` operation for $like', () => {

            let criteria = {
                'filter': {'generationName': {'$like': 'foo_'}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' LIKE 'foo_')`
            );
        });

        it('should do `NOT LIKE` operation for $nlike', () => {

            let criteria = {
                'filter': {'generationName': {'$nlike': 'foo_'}}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' NOT LIKE 'foo_')`
            );
        });

        it('should do `>` operation for $gt', () => {

            let criteria = {
                'filter': {'generationId': {'$gt': 5}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' > 5)`
            );
        });

        it('should do `>=` operation for $gte', () => {

            let criteria = {
                'filter': {'generationId': {'$gte': 5}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' >= 5)`
            );
        });

        it('should do `<` operation for $lt', () => {

            let criteria = {
                'filter': {'generationId': {'$lt': 5}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' < 5)`
            );
        });

        it('should do `<=` operation for $lte', () => {

            let criteria = {
                'filter': {'generationId': {'$lte': 5}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' <= 5)`
            );
        });

        it('should do `IN` operation for $in', () => {

            let criteria = {
                'filter': {'generationId': {'$in': [5, 6]}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
            );
        });

        it('should do `IN` operation if attribute value is array', () => {

            let criteria = {
                'filter': {'generationId': [5, 6]}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
            );
        });

        it('should do `NOT IN` operation for $nin', () => {
            let criteria = {
                'filter': {'generationId': {'$nin': [5, 6]}}
            };

            UtilsQueryApplyFilter(q, ['generationId'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' NOT IN (5, 6))`
            );
        });

        it('should be possible to combine multiple operators on same attribute', () => {
            let criteria = {
                'filter': {'generationName': {'$eq': 'bar', '$neq': 'foo', }}
            };

            UtilsQueryApplyFilter(q, ['generationName'], criteria);
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationName' = 'bar' AND 'generations'.'generationName' != 'foo')`
            );
        });
    });

    describe('#apply-filter() - generationParents', () => {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        it('should do `IN` and `HAVING COUNT` for generationParents $eq', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$eq': [13, 37, 42]}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (13, 37, 42)) GROUP BY generation_parents.generationId HAVING (count('generation_parents'.'plantId') = 3)))`
            );
        });

        it('should do an $eq for generationParents array short hand', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {'generationParents': [42,43]}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (42, 43)) GROUP BY generation_parents.generationId HAVING (count('generation_parents'.'plantId') = 2)))`);
        });

        it('should do `NOT IN` for generationParents $neq', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$neq': [13, 37, 42]}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT IN (13, 37, 42)) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `LIKE` for generationParents $like', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$like': '13_7'}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' LIKE '13_7') GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `NOT LIKE` for generationParents $nlike', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$nlike': '13_7'}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT LIKE '13_7') GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `>` for generationParents $gt', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$gt': 42}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' > 42) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `>=` for generationParents $gte', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$gte': 42}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' >= 42) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `<` for generationParents $lt', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$lt': 42}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' < 42) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `<=` for generationParents $lte', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$lte': 42}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' <= 42) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `IN` for generationParents $in', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$in': [42, 43]}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (42, 43)) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `=` for generationParents integer/string short hand', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: 42}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' = 42) GROUP BY generation_parents.generationId))`
            );
        });

        it('should do `NOT IN` for generationParents $nin', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {generationParents: {'$nin': [42, 43]}}});
            q.toString().should.eql(
                `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT IN (42, 43)) GROUP BY generation_parents.generationId))`
            );
        });
    });

    describe('#apply-filter() - old tests (general)', () => {
        let q;

        beforeEach(() => {
            q = squel.select().from('test');
        });

        it('should not do anything if options.filter is not an plainObject', () => {
            UtilsQueryApplyFilter(q, [], {});
            q.toString().should.eql('SELECT * FROM test');
        });

        it('should set WHERE (translated)field = fieldValue if options.filter[field] = fieldValue is an integer and correctly translate field to database.databasefield', () => {
            UtilsQueryApplyFilter(q, ['familyId'], {filter: {'familyId': 42}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('families'.'familyId' = 42)`);
        });

        it('should set WHERE (translated)field = "fieldValue" if options.filter[field] = fieldValue is a string', () => {
            UtilsQueryApplyFilter(q, ['generationName'], {filter: {'generationName': 'testGenerationName'}});
            q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationName' = 'testGenerationName')`);
        });


        it('should do nothing if options.filter key is valid but value is something we don\'t know how to handle (for field !== generationParents)', () => {
            UtilsQueryApplyFilter(q, ['generationName'], {filter: {'generationName': () => {}}});
            q.toString().should.eql(`SELECT * FROM test`);
        });

        it('should do nothing if options.filter key is valid but value is something we don\'t know how to handle (for field === generationParents)', () => {
            UtilsQueryApplyFilter(q, ['generationParents'], {filter: {'generationParents': () =>{}}});
            q.toString().should.eql(`SELECT * FROM test`);
        });
    });

    //describe('#apply-filter() - binary operators for generationParents', () => {
    //    it('should do ');
    //});
});
