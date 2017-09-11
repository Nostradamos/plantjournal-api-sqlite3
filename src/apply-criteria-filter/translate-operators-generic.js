class TranslateOperatorsGeneric {
    static translateAndApplyOperators(self, attr, attrOptions, squelExpr, type) {
        let self = {self, attr, attrOptions, squelExpr, type};

        this.getTable(self);

        if(_.isPlainObject(attrOptions)) {

        } else {
            this.handleShortHands(self);
        }
    }

    static getTable(self) {
        self.table = undefined;
    }

    static handleOperators(self) {
        let handledOperators = 0;
        let lengthAttrOptions = self.attrOptions.length;

        let crits = {};
        for(operator of this.OPERATORS) {
            let operatorFunc = this.OPERATORS[operator];
            let operatorOptions = self.attrOptions[operator];

            if(!_.isUndefined(operatorOptions)) {
                [crits.crit, crits.args]  = [null, []];
                operatorFunc(self, operatorOptions, crits);

                this._applyCrits(self, crits);

                handledOperators++;
            }

            // We want to do as less loops as possible
            if(handledOperators >= lengthAttrOptions) break;
        }
    }

    static handleShortHands(self) {
        let crits = {crit: null, args: []};

        if (_.isString(self.attrOptions) || _.isNumber(self.attrOptions) || _.isBoolean(self.attrOptions)) {
            this.handleStringNumberBooleanShortHand(self, crits);
        } else if (_.isArray(self.attrOptions)) {
            this.handleArrayShortHand(self, crits);
        } else {
        }

        this._applyCrits(self, crits);
    }

    static handleStringNumberBooleanShortHand(self) {

    }

    static handleArrayShortHand(self) {

    }

    static unhandledShortHand(self) {
        logger.wanr

    }

    static _applyCrits(self, crits) {
        if(crits.crit !== null) {
            applyCriteriaToExpression(
                self.squelExpr, ...crits, self.type);
        } else {
            logger.warn('Crits.crit is null');
        }
    }
}

TranslateOperatorsGeneric.OPERATORS = [];

module.exports = TranslateOperatorsGeneric;
