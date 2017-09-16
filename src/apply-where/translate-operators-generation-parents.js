'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require('./translate-operators-relational');

class TranslateOperatorsGenerationParents extends TranslateOperatorsRelational {
    static getTable(self) {
        self.table = CONSTANTS.TABLE_GENERATION_PARENT;
    }
    /**
     * We can force set attribute (self.attr) to plantId, because we will only
     * query this attribute. Also the the table we will query will always be
     * generationParents.
     * Besides that we need to redirect self.squelExpr to a new squel expression
     * because we want to build a subquery in the end. We also need another
     * squel expression to handle the having part of the new sub query.
     * @param  {Object} self
     */
    static modifySelf(self) {
        self.attr = CONSTANTS.ATTR_ID_PLANT;
        self.squelExprOld = self.squelExpr;
        self.squelExpr = squel.expr();
        self.squelExprHaving = squel.expr();
    }

    static operatorEquals(self, operatorOptions, crit) {
        this.operatorIn(self, operatorOptions, crit);

        let [critHaving, critHavingArgs] = UtilsExpression.
            createEqualsExpression(self.table, self.attr, operatorOptions.length, 'count');

        logger.silly(this.name, '#operatorEquals()', critHaving, critHavingArgs);

        UtilsExpression.applyExpression(
            self.squelExprHaving, critHaving, critHavingArgs, self.type);

    }

    static operatorNotEquals(self, operatorOptions, crit) {
        this.operatorNotIn(self, operatorOptions, crit);
    }

    static processStringNumberBooleanNullShortHand(self, crit) {
        super.operatorEquals(self, self.attrOptions, crit);
    }

    static processArrayShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    /**
     * asd
     * @param  {Object} self
     */
    static beforeDone(self) {
        // Make sure we have any expressions to add
        let emptySquelExpr = _.isEmpty(self.squelExpr._nodes);
        let emptySquelExprHaving = _.isEmpty(self.squelExprHaving._nodes);

        if(emptySquelExpr && emptySquelExprHaving) return;

        let subQuery = squel.select()
            .from(CONSTANTS.TABLE_GENERATION_PARENT, 'generation_parents')
            .field('generation_parents.generationId')
            .group('generation_parents.generationId');

        if(!emptySquelExpr) subQuery.where(self.squelExpr);

        if(!emptySquelExprHaving) subQuery.having(self.squelExprHaving);

        logger.silly(
            '#applyCriteriaFilter #translateAndApplyGenerationParentsOperators() ' +
            'generationParents subQuery:', subQuery.toString());

        UtilsExpression.applyExpression(
            self.squelExprOld,
            '?.? IN ?',
            [
                CONSTANTS.TABLE_GENERATION,
                CONSTANTS.ATTR_ID_GENERATION,
                subQuery
            ],
            self.type
        );
    }
}

TranslateOperatorsGenerationParents.OPERATORS = _.clone(TranslateOperatorsRelational.OPERATORS);

TranslateOperatorsGenerationParents.OPERATORS.$eq = TranslateOperatorsGenerationParents.operatorEquals;
TranslateOperatorsGenerationParents.OPERATORS.$neq = TranslateOperatorsGenerationParents.operatorNotEquals;


module.exports = TranslateOperatorsGenerationParents;
