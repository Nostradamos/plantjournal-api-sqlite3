'use strict';

require('should');
const _ = require('lodash');

const squel = require('squel');

var TranslateOperatorsGeneric = require(
    '../../../src/apply-criteria/translate-operators-generic');

describe('TranslateOperatorsGeneric', () => {
    describe('#callOperatorFuncsAndApplyCriterias()', () => {
        beforeEach(() => {
            TranslateOperatorsGeneric.OPERATORS = [];
        });

        it('should call operatorFunc with second argument being operatorOptions if operator is defined in attrOptions', () => {
            let gotCalled = false;

            TranslateOperatorsGeneric.OPERATORS['$eq'] = (self, operatorOptions, crit) => {
                operatorOptions.should.eql('test');
                gotCalled = true;
            }

            TranslateOperatorsGeneric.callOperatorFuncsAndApplyCriterias({
                attrOptions: {'$eq': 'test'}
            });

            gotCalled.should.be.true();
        });

        it('should not call operator if operator is not defined in attrOptions', () => {
            let gotCalled = false;

            TranslateOperatorsGeneric.OPERATORS['$eq'] = (self, operatorOptions, crit) => {
                gotCalled = true;
            }

            TranslateOperatorsGeneric.callOperatorFuncsAndApplyCriterias({
                attrOptions: {'$neq': 'test'}
            });

            gotCalled.should.be.false();
        });

        it('should apply critieria from operatorFunc to self.squelExpr', () => {
            TranslateOperatorsGeneric.OPERATORS['$eq'] = (self, operatorOptions, crit) => {
                crit.crit = "?.? = ?";
                crit.args = [1, 2, operatorOptions];
                console.log("hallo");
            }

            let self = {
                attrOptions: {'$eq': 'test'}, squelExpr: squel.expr(),
                type: 'and'};

            TranslateOperatorsGeneric.callOperatorFuncsAndApplyCriterias(self);

            self.squelExpr._nodes.should.eql(
                [{ type: 'AND', expr: '?.? = ?', para: [1, 2, 'test']}]);
        });
    });

    describe('#checkForShortHands()', () => {
        let clonedTranslate;

        before(() => {
            clonedTranslate = class extends TranslateOperatorsGeneric {};
        });

        beforeEach(() => {
            TranslateOperatorsGeneric = class extends clonedTranslate {};
        });

        it('should execute #unhandledShortHand() if attrOptions has an unhandled datatype', () => {
            let gotCalled = false;

            TranslateOperatorsGeneric.unhandledShortHand = function(self) {
                gotCalled = true;
            }

            TranslateOperatorsGeneric.checkForShortHands({attrOptions: Function});
            should(gotCalled).be.true();
        });

        it('should call #processStringNumberBooleanNullShortHand() if attrOptions is a string', () =>   {
            let gotCalled = false;

            TranslateOperatorsGeneric.processStringNumberBooleanNullShortHand = function(self) {
                gotCalled = true;
            }

            TranslateOperatorsGeneric.checkForShortHands({attrOptions: "Test"});
            should(gotCalled).be.true();
        });

        it('should call #processArrayShortHand if attrOptions is an array', () =>   {
            let gotCalled = false;

            TranslateOperatorsGeneric.processArrayShortHand = function(self) {
                gotCalled = true;
            }

            TranslateOperatorsGeneric.checkForShortHands({attrOptions: [1,2]});
            should(gotCalled).be.true();
        });

        it('should apply crits from proccessArrayShortHand function', () => {
            TranslateOperatorsGeneric.processArrayShortHand = function(self, crit) {
                crit.crit = "?.? IN ?";
                crit.args = ['foo', 'bar', self.attrOptions];
            }

            let self = {squelExpr: squel.expr(), type: 'and', attrOptions: [1,2]};

            TranslateOperatorsGeneric.checkForShortHands(self);
            self.squelExpr._nodes.should.eql(
                [{ type: 'AND', expr: '?.? IN ?', para: ['foo', 'bar', [1,2]]}]);
        });
    });

});
