/* eslint-env node, mocha */
'use strict';

const should = require('should');
const _ = require('lodash');

const UtilsQuery = require('../src/utils/utils-query');

/********************
 * HELPER FUNCTIONS
 * FOR UNIT TESTS
 ********************/

var UtilsTest = module.exports;

UtilsTest.allShouldHaveCreatedAtAndModifiedAt = (retObj, plural, singular) => {
  retObj.should.have.property(plural);

  for(let key of _.keys(retObj[plural])) {
    retObj[plural][key]
      .should.have.property(singular + 'CreatedAt');
    retObj[plural][key]
      .should.have.property(singular + 'ModifiedAt');
  }
};

UtilsTest.allFamiliesShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(retObj, 'families', 'family');
};


UtilsTest.allGenerationsShouldHaveCreatedAtAndModifiedAt = (retObj) => {
  // Make sure every generation has generationCreatedAt and
  // generationModifiedAt attributes.
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(
    retObj, 'generations', 'generation');
};

UtilsTest.allGenotypesShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(
    retObj, 'genotypes', 'genotype');
};

UtilsTest.allPlantsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(
    retObj, 'plants', 'plant');
};

UtilsTest.allMediumsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(
    retObj, 'mediums', 'medium');
};

UtilsTest.allEnvironmentsShouldHaveCreatedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveCreatedAtAndModifiedAt(
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
