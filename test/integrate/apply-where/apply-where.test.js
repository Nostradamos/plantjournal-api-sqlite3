/* eslint-env node, mocha */
'use strict';

const should = require('should');

const squel = require('squel');

const applyWhere = require('../../../src/apply-where/apply-where');


describe(`src/apply-where/apply-where`, () => {
    describe(`#applyWhere`, () => {
        let q;
        beforeEach(() => q = squel.select().from('test'));

        describe(`errors`, () => {
            it(`should throw error if unknown logical operator is used`, () => {
                should(
                    () => {
                        applyWhere
                        (
                            q,
                            ['generationId', 'generationName'],
                            {'where': {'$nand': {'generationId': 'a'}}}
                        );
                    }
                ).throw('Illegal attribute or unknown logical operator: $nand');
            });

            it(`should throw error if attribute is not in allowedFields`, () => {
                should(
                    () => applyWhere(q, [], {where: {'generationName': 'testGenerationName', 'generationParents': [1,2]}})
                ).throw('Illegal attribute or unknown logical operator: generationName');
            });
        });

        describe(`boolean operators`, () => {
            it(`should do AND conjunction for $and`, () => {
                let criteria = {
                    'where': {'$and': {'generationId': 'a', 'generationName': 'b'}}
                };

                applyWhere(q, ['generationId', 'generationName'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b')`
                );
            });

            it(`should do OR conjunction for $or`, () => {
                let criteria = {
                    'where': {'$or': {'generationId': 'a', 'generationName': 'b'}}
                };

                applyWhere(q, ['generationId', 'generationName'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b')`
                );
            });

            it(`should do AND conjunction for nested $and`, () => {
                let criteria = {
                    'where': {'generationId': 'a', '$and': {'generationName': 'b', '$and' : {'familyId': 'c'}}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b' AND 'families'.'familyId' = 'c')`
                );
            });

            it(`should do OR conjunction for nested $and`, () => {
                let criteria = {
                    'where': {'generationId': 'a', '$or': {'generationName': 'b', '$or' : {'familyId': 'c'}}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationName' = 'b' OR 'families'.'familyId' = 'c')`
                );
            });

            it(`should do mixed AND/OR conjunction for nested and mixed $and/$or`, () => {
                let criteria = {
                    'where': {'generationId': 'a', '$or': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c')`
                );
            });

            it(`should do AND sub expression (=>AND (..)) for $and()`, () => {
                let criteria = {
                    'where': {'$and()': {'generationId': 'a', '$and': {'generationName': 'b'}}, '$or()': {'generationId': 'c', '$and': {'generationName': 'd'}}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE (('generations'.'generationId' = 'a' AND 'generations'.'generationName' = 'b') OR ('generations'.'generationId' = 'c' AND 'generations'.'generationName' = 'd'))`
                );

            });

            it(`should do OR sub expression (=>OR (..)) for $or()`, () => {
                let criteria = {
                    'where': {'generationId': 'a', '$or()': {'generationId': 'b', '$and' : {'familyId': 'c'}}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR ('generations'.'generationId' = 'b' AND 'families'.'familyId' = 'c'))`
                );
            });

            it(`should do AND conjunction for dicts if it's not a child of $and/$or..`, () => {
                let criteria = {
                    'where': {'generationId': 'a', 'familyId': 'c'}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
                );
            });

            it(`should do OR conjunction for arrays if it's not a child of $and/$or..`, () => {
                let criteria = {
                    'where': [{'generationId': 'a'}, {'familyId': 'c'}]
                };

                applyWhere(q, ['generationId', 'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
                );
            });

            it(`should do AND conjunctions for arrays if it's a child of $and`, () => {
                let criteria = {
                    'where': {'generationName': 'b', '$and':[{'generationId': 'a'}, {'familyId': 'c'}]}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' AND 'generations'.'generationId' = 'a' AND 'families'.'familyId' = 'c')`
                );
            });

            it(`should do OR conjunctions for dicts if it's a child of $or`, () => {
                let criteria = {
                    'where': {'generationName': 'b', '$or': {'generationId': 'a', 'familyId': 'c'}}
                };

                applyWhere(q, ['generationId',
                    'generationName',
                    'familyId'], criteria);

                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 'b' OR 'generations'.'generationId' = 'a' OR 'families'.'familyId' = 'c')`
                );
            });

        });
        describe(`relational operators`, () => {
            it(`should do an '=' (equals) operation for $eq`, () => {
                let criteria = {
                    'where': {'generationName': {'$eq': 'foo'}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
                );
            });

            it(`should do an '=' (equals) operation if attribute value is string`, () => {
                let criteria = {
                    'where': {'generationName': 'foo'}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 'foo')`
                );
            });

            it(`should do an '=' (equals) operation if attribute value is integer`, () => {
                let criteria = {
                    'where': {'generationName': 1}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 1)`
                );
            });

            it(`should do an 'IS NULL' (is null) operation if attribute value is null`, () => {
                let criteria = {
                    'where': {'generationName': null}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' IS NULL)`
                );
            });

            it(`should do an 'IS NULL' (is null) operation if $eq value is null`, () => {
                let criteria = {
                    'where': {'generationName': {'$eq': null}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' IS NULL)`
                );
            });


            it(`should do an '!=' (not equals) operation for $neq`, () => {
                let criteria = {
                    'where': {'generationName': {'$neq': 'foo'}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' != 'foo')`
                );
            });

            it(`should do an 'IS NOT NULL' (is not null) operation for $neq: null`, () => {
                let criteria = {
                    'where': {'generationName': {'$neq': null}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' IS NOT NULL)`
                );
            });

            it(`should do 'LIKE' operation for $like`, () => {

                let criteria = {
                    'where': {'generationName': {'$like': 'foo_'}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' LIKE 'foo_')`
                );
            });

            it(`should do 'NOT LIKE' operation for $nlike`, () => {

                let criteria = {
                    'where': {'generationName': {'$nlike': 'foo_'}}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' NOT LIKE 'foo_')`
                );
            });

            it(`should do '>' operation for $gt`, () => {

                let criteria = {
                    'where': {'generationId': {'$gt': 5}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' > 5)`
                );
            });

            it(`should do '>=' operation for $gte`, () => {

                let criteria = {
                    'where': {'generationId': {'$gte': 5}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' >= 5)`
                );
            });

            it(`should do '<' operation for $lt`, () => {

                let criteria = {
                    'where': {'generationId': {'$lt': 5}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' < 5)`
                );
            });

            it(`should do '<=' operation for $lte`, () => {

                let criteria = {
                    'where': {'generationId': {'$lte': 5}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' <= 5)`
                );
            });

            it(`should do 'IN' operation for $in`, () => {

                let criteria = {
                    'where': {'generationId': {'$in': [5, 6]}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
                );
            });

            it(`should do 'IN' operation if attribute value is array`, () => {

                let criteria = {
                    'where': {'generationId': [5, 6]}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (5, 6))`
                );
            });

            it(`should do 'NOT IN' operation for $nin`, () => {
                let criteria = {
                    'where': {'generationId': {'$nin': [5, 6]}}
                };

                applyWhere(q, ['generationId'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' NOT IN (5, 6))`
                );
            });

            it(`should be possible to combine multiple operators on same attribute`, () => {
                let criteria = {
                    'where': {'generationName': {'$eq': 'bar', '$neq': 'foo', }}
                };

                applyWhere(q, ['generationName'], criteria);
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationName' = 'bar' AND 'generations'.'generationName' != 'foo')`
                );
            });
        });

        describe(`generationParents`, () => {
            it(`should do 'IN $opValue' and 'HAVING COUNT(..) = $opValue.length' for generationParents $eq`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$eq': [13, 37, 42]}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (13, 37, 42)) GROUP BY generation_parents.generationId HAVING (count('generation_parents'.'plantId') = 3)))`
                );
            });

            it(`should do an $eq for generationParents array short hand`, () => {
                applyWhere(q, ['generationParents'], {where: {'generationParents': [42,43]}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (42, 43)) GROUP BY generation_parents.generationId HAVING (count('generation_parents'.'plantId') = 2)))`);
            });

            it(`should do 'NOT IN' and 'HAVINC COUNT(..) >= $opValue.length' for generationParents $neq`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$neq': [13, 37, 42]}}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` GROUP BY generation_parents.generationId HAVING (count(generation_parents.plantId) != 3) UNION SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generations'.'generationId' NOT IN (13, 37, 42))))))`);
            });

            it(`should do 'NOT IN' for generationParents $neq when operator value is a single integer`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$neq': 42}}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` GROUP BY generation_parents.generationId HAVING (count(generation_parents.plantId) != 1) UNION SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generations'.'generationId' NOT IN (42))))))`);
            });

            it(`should do 'LIKE' for generationParents $like`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$like': '13_7'}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' LIKE '13_7')))`
                );
            });

            it(`should do 'NOT LIKE' for generationParents $nlike`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$nlike': '13_7'}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT LIKE '13_7')))`
                );
            });

            it(`should do '>' for generationParents $gt`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$gt': 42}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' > 42)))`
                );
            });

            it(`should do '>=' for generationParents $gte`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$gte': 42}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' >= 42)))`
                );
            });

            it(`should do '<' for generationParents $lt`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$lt': 42}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' < 42)))`
                );
            });

            it(`should do '<=' for generationParents $lte`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$lte': 42}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' <= 42)))`
                );
            });

            it(`should do 'IN' for generationParents $in`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$in': [42, 43]}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (42, 43))))`
                );
            });

            it(`should do 'NOT IN' for generationParents $nin`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$nin': [42, 43]}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT IN (42, 43))))`
                );
            });

            it(`should do '=' for generationParents integer/string short hand`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: 42}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' = 42)))`
                );
            });

            it(`should do 'IN $opV' and 'HAVING COUNT >= $opV.length' for $has operator`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$has': [13, 37, 42]}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' IN (13, 37, 42)) GROUP BY generation_parents.generationId HAVING (count('generation_parents'.'plantId') >= 3)))`
                );
            });

            it(`should do 'NOT IN $opV' and for $nhas operator`, () => {
                applyWhere(q, ['generationParents'], {where: {generationParents: {'$nhas': [13, 37, 42]}}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE ('generations'.'generationId' IN (SELECT generation_parents.generationId FROM generation_parents \`generation_parents\` WHERE ('generation_parents'.'plantId' NOT IN (13, 37, 42))))`
                );
            });
        });

        describe(`journalValue`, () => {
            it(`should set WHERE journals.journalValue = "foo" if attr is just journalValue`, () => {
                applyWhere(q, ['journalValue'], {where: {'journalValue': 'foo'}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('journals'.'journalValue' = 'foo')`);
            });

            it(`should set WHERE json_extract(journals.journalValue, "$.foo.bar[2]") = "foo" if attr is journalValue.foo.bar[2]`, () => {
                applyWhere(q, ['journalValue'], {where: {'journalValue.foo.bar[2]': 'foo'}});
                q.toString().should.eql(
                    `SELECT * FROM test WHERE (json_extract('journals'.'journalValue', '$.foo.bar[2]') = 'foo')`);
            });
        });

        describe(`old tests`, () => {
            it(`should not do anything if options.where is not an plainObject`, () => {
                applyWhere(q, [], {});
                q.toString().should.eql('SELECT * FROM test');
            });

            it(`should set WHERE (translated)field = fieldValue if options.where[field] = fieldValue is an integer and correctly translate field to database.databasefield`, () => {
                applyWhere(q, ['familyId'], {where: {'familyId': 42}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('families'.'familyId' = 42)`);
            });

            it(`should set WHERE (translated)field = "fieldValue" if options.where[field] = fieldValue is a string`, () => {
                applyWhere(q, ['generationName'], {where: {'generationName': 'testGenerationName'}});
                q.toString().should.eql(`SELECT * FROM test WHERE ('generations'.'generationName' = 'testGenerationName')`);
            });

            it(`should do nothing if options.where key is valid but value is something we don't know how to handle (for field !== generationParents)`, () => {
                applyWhere(q, ['generationName'], {where: {'generationName': () => {}}});
                q.toString().should.eql(`SELECT * FROM test`);
            });

            it(`should do nothing if options.where key is valid but value is something we don't know how to handle (for field === generationParents)`, () => {
                applyWhere(q, ['generationParents'], {where: {'generationParents': () =>{}}});
                q.toString().should.eql(`SELECT * FROM test`);
            });
        });

    });
});
