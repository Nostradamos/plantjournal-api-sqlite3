'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require('./translate-operators-relational');

/**
 * This class translates criterias for generationParents.
 * For example if you have a criteria object like this:
 * ```
 * {
 *  generationParents: {
 *      $eq: [1,2]
 *  },
 *  generationName: 'Blubb'
 * }
 * ```
 * Then we would process the "$eq: [1,2]" stuff inside this class.
 * NOTE: This class only contains static methods, so you can't create
 * a new instance of this class. To call this class, just call
 * TranslateOperatorsRelational.translateAndApplyOperators().
 */
class TranslateOperatorsGenerationParents extends TranslateOperatorsRelational {
    /**
     * Table will always be generation_parents, hardcode it.
     * @param  {Object} self
     *         Object containing information about this translation process
     */
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
     *         Object containing information about this translation process
     */
    static modifySelf(self) {
        self.attr = CONSTANTS.ATTR_ID_PLANT;
        self.squelExprOld = self.squelExpr;
        self.squelExpr = squel.expr();
        self.squelExprHaving = squel.expr();
    }

    /**
     * Operator function handling equals. We can't simply use the method
     * provided by TranslateOperatorsRelational because of the way we store
     * the generationParents. Each parent is in a own row which we join to.
     * So we get a row for every parent, for this row we need to make sure
     * that the id is in our equals array (operatorOptions), plus we need to
     * make sure that we selected exactly operatorOptions.length parents by
     * using a HAVIN expression.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Integer[]} operatorOptions
     *         Array of integers which represent the plantIds (parentIds)
     *         we want to check against
     * @param  {Object} crit
     *         Expression object
     */
    static operatorEquals(self, operatorOptions, crit) {
        this.operatorIn(self, operatorOptions, crit);

        let [critHaving, critHavingArgs] = UtilsExpression.
            createEqualsExpression(self.table, self.attr, operatorOptions.length, 'count');

        logger.silly(this.name, '#operatorEquals()', critHaving, critHavingArgs);

        UtilsExpression.applyExpression(
            self.squelExprHaving, critHaving, critHavingArgs, self.type);

    }

    /**
     * Operator function for equals NOT ($neq)
     * NOTE: Can't use the TranslateOperatorsRelational.operatorNotEquals()
     * method because we need don't really do an not equals, but more an not in.
     * Remind that we check against an array of plantIds/parentIds.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number[]} operatorOptions
     *         We want to find records, where attribute value is not in
     *         this array.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static operatorNotEquals(self, operatorOptions, crit) {
        this.operatorNotIn(self, operatorOptions, crit);
    }

    /**
     * This short hand should just does an equals operation, but we need to call
     * the TranslateOperatorsGenerationParents.operatorEquals() method,
     * therefore we need to reassign it.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static processStringNumberBooleanNullShortHand(self, crit) {
        super.operatorEquals(self, self.attrOptions, crit);
    }

    /**
     * And this short hand should does an equals operation, but we need to call
     * the TranslateOperatorsGenerationParents.operatorEquals() method,
     * therefore we need to reassign it.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static processArrayShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    /**
     * Before we're done, we need to build a sub query which selects all
     * generationIds where a plantIds/parentIds matches and maybe even
     * a having clause.
     * @param  {Object} self
     *         Object containing information about this translation process
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

TranslateOperatorsGenerationParents.OPERATORS = _.clone(
    TranslateOperatorsRelational.OPERATORS);

// Overwrite our equals/not equals operatorFuncs for generationParents
TranslateOperatorsGenerationParents.OPERATORS.$eq =
    TranslateOperatorsGenerationParents.operatorEquals;
TranslateOperatorsGenerationParents.OPERATORS.$neq =
    TranslateOperatorsGenerationParents.operatorNotEquals;

module.exports = TranslateOperatorsGenerationParents;
