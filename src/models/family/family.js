'use strict';

const AbstractModel = require('../abstract/abstract-model');

class Family extends AbstractModel {
}

Family.CLASS_ADD = require('./family-add');

module.exports = Family;
