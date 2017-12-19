/* eslint-env node, mocha */
'use strict';

require('should');
const squel = require('squel');

var TranslateOperatorsRelational = require(
  '../../../src/apply-where/translate-operators-relational');

describe(`TranslateOperatorsRelational`, () => {
  describe(`#translateAndApplyOperators()`, () => {
    let query, squelExpr;

    beforeEach(() => {
      squelExpr = squel.expr();
      query = squel.select().from('test');
    });

    it(`should apply an TABLE.ATTR = OPEARTOROPTIONS expression for $eq`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', {'$eq': 'TestEnvironment420'},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (environments.environmentName = 'TestEnvironment420')`);
    });

    it(`should apply an TABLE.ATTR != OPEARTOROPTIONS expression for $neq`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', {'$neq': 'TestEnvironment420'},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (environments.environmentName != 'TestEnvironment420')`);
    });

    it(`should apply an TABLE.ATTR LIKE OPEARTOROPTIONS expression for $like`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', {'$like': '_estEnvironment420'},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (environments.environmentName LIKE '_estEnvironment420')`);
    });

    it(`should apply an TABLE.ATTR NOT LIKE OPEARTOROPTIONS expression for $nlike`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', {'$nlike': '_estEnvironment420'},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (environments.environmentName NOT LIKE '_estEnvironment420')`);
    });

    it(`should apply an TABLE.ATTR > OPEARTOROPTIONS expression for $gt`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$gt': 3},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId > 3)`);
    });

    it(`should apply an TABLE.ATTR >= OPEARTOROPTIONS expression for $gte`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$gte': 3},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId >= 3)`);
    });

    it(`should apply an TABLE.ATTR < OPEARTOROPTIONS expression for $lt`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$lt': 3},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId < 3)`);
    });

    it(`should apply an TABLE.ATTR <= OPEARTOROPTIONS expression for $lte`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$lte': 3},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId <= 3)`);
    });

    it(`should apply an TABLE.ATTR IN OPEARTOROPTIONS expression for $in`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$in': [3, 4]},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId IN (3, 4))`);
    });


    it(`should apply an TABLE.ATTR NOT IN OPEARTOROPTIONS expression for $nin`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentId', {'$nin': [3, 4]},
        squelExpr, 'and');

      query.where(squelExpr).toString().should.eql(
        `SELECT * FROM test WHERE (environments.environmentId NOT IN (3, 4))`);
    });

    it(`should apply an TABLE.ATTR = ATTROPTIONS for ATTR:ATTROPTIONS if ATTROPTIONS is a string (string shorthand)`, () => {
      let squelExpr = squel.expr();

      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', 'TestEnvironment420',
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (environments.environmentName = 'TestEnvironment420')`);
    });

    it(`should apply an TABLE.ATTR IN ATTROPTIONS for ATTR:ATTROPTIONS if ATTROPTIONS is an array (array shorthand)`, () => {
      TranslateOperatorsRelational.translateAndApplyOperators(
        {}, 'environmentName', ['TestEnvironment420', 'TestEnv2'],
        squelExpr, 'and');

      query.where(squelExpr).toString().should.sqlEql(
        `SELECT * FROM test
         WHERE (
           environments.environmentName IN ('TestEnvironment420', 'TestEnv2')
         )`);
    });
  });
});
