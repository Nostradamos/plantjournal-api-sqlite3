'use strict';

require('should');
const _ = require('lodash');

const squel = require('squel');

var TranslateOperatorsRelational = require(
    '../../../src/apply-criteria/translate-operators-relational');

describe('TranslateOperatorsRelational', () => {
    describe('#translateAndApplyOperators()', () => {
        it('should apply an TABLE.ATTR = OPEARTOROPTIONS expression for $eq', () => {
            let squelExpr = squel.expr();

            TranslateOperatorsRelational.translateAndApplyOperators(
                {}, 'environmentName', {'$eq': 'TestEnvironment420'},
                squelExpr, 'and');

            squelExpr._nodes.should.eql(
                [{type:'AND',expr:'?.? = ?',
                para:['environments', 'environmentName', 'TestEnvironment420']}]);
        });

    });
});
