/* eslint-env node, mocha */
'use strict';

const should = require('should');
const _ = require('lodash');

const UtilsQuery = require('../src/utils/utils-query');

/********************
 * HELPER FUNCTIONS
 * FOR UNIT TESTS
 ********************/

var helpers = module.exports;

helpers.allShouldHaveCreatedAtAndModifiedAt = (retObj, plural, singular) => {
  retObj.should.have.property(plural);

  for(let key of _.keys(retObj[plural])) {
    retObj[plural][key]
      .should.have.property(singular + 'CreatedAt');
    retObj[plural][key]
      .should.have.property(singular + 'ModifiedAt');
  }
};

helpers.allFamiliesShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  helpers.allShouldHaveCreatedAtAndModifiedAt(retObj, 'families', 'family');
};


helpers.allGenerationsShouldHaveCreatedAtAndModifiedAt = (retObj) => {
  // Make sure every generation has generationCreatedAt and
  // generationModifiedAt attributes.
  helpers.allShouldHaveCreatedAtAndModifiedAt(retObj, 'generations', 'generation');
};

helpers.allGenotypesShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  helpers.allShouldHaveCreatedAtAndModifiedAt(retObj, 'genotypes', 'genotype');
};

helpers.allPlantsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  helpers.allShouldHaveCreatedAtAndModifiedAt(retObj, 'plants', 'plant');
};

helpers.allMediumsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  helpers.allShouldHaveCreatedAtAndModifiedAt(retObj, 'mediums', 'medium');
};

helpers.allEnvironmentsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  helpers.allShouldHaveCreatedAtAndModifiedAt(
    retObj, 'environments', 'environment');
};

/**
 * Assertion to equal sql strings, even if they have newlines and a different
 * amount of whitespaces
 * @param {sqlString} - some sql string
 */
should.Assertion.add('sqlEql', function(sqlString) {
  this.params = {operator:'to be equal sql strings'};
  UtilsQuery.stripSQL(this.obj).should.eql(
    UtilsQuery.stripSQL(sqlString));
});
