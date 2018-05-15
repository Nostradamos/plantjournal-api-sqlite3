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

UtilsTest.allShouldHaveAddedAtAndModifiedAt = (retObj, plural, singular) => {
  retObj.should.have.property(plural);

  for(let key of _.keys(retObj[plural])) {
    retObj[plural][key]
      .should.have.property(singular + 'AddedAt');
    retObj[plural][key]
      .should.have.property(singular + 'ModifiedAt');
  }
};

UtilsTest.allFamiliesShouldHaveAddedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(retObj, 'families', 'family');
};


UtilsTest.allGenerationsShouldHaveAddedAtAndModifiedAt = (retObj) => {
  // Make sure every generation has generationAddedAt and
  // generationModifiedAt attributes.
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(
    retObj, 'generations', 'generation');
};

UtilsTest.allGenotypesShouldHaveAddedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(
    retObj, 'genotypes', 'genotype');
};

UtilsTest.allPlantsShouldHaveAddedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(
    retObj, 'plants', 'plant');
};

UtilsTest.allMediumsShouldHaveAddedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(
    retObj, 'mediums', 'medium');
};

UtilsTest.allEnvironmentsShouldHaveAddedAtAndModifiedAt = function(retObj) {
  UtilsTest.allShouldHaveAddedAtAndModifiedAt(
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
