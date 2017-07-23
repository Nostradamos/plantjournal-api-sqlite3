const _ = require('lodash');
const should = require('should');

/********************
 * HELPER FUNCTIONS
 * FOR UNIT TESTS
 ********************/

module.exports.allFamiliesShouldHaveCreatedAtAndModifiedAtFields = function(returnObject) {
  returnObject.should.have.property('families');
  _.each(_.keys(returnObject.families), function(key) {
    returnObject.families[key].should.have.property('familyCreatedAt');
    returnObject.families[key].should.have.property('familyModifiedAt');
  });
}


module.exports.allGenerationsShouldHaveCreatedAtAndModifiedAtFields = function(returnObject) {
  // Make sure every generation has generationCreatedAt and generationModifiedAt attributes.
  returnObject.should.have.property('generations');
  _.each(_.keys(returnObject.generations), function(key) {
    returnObject.generations[key].should.have.property('generationCreatedAt');
    returnObject.generations[key].should.have.property('generationModifiedAt');
  });
}

module.exports.allGenotypesShouldHaveCreatedAtAndModifiedAtFields = function(returnObject) {
  returnObject.should.have.property('genotypes');
  _.each(_.keys(returnObject.genotypes), function(key) {
    returnObject.genotypes[key].should.have.property('genotypeCreatedAt');
    returnObject.genotypes[key].should.have.property('genotypeModifiedAt');
  });
}

module.exports.allPlantsShouldHaveCreatedAtAndModifiedAtFields = function(returnObject) {
  returnObject.should.have.property('plants');
  _.each(_.keys(returnObject.plants), function(key) {
    returnObject.plants[key].should.have.property('plantCreatedAt');
    returnObject.plants[key].should.have.property('plantModifiedAt');
  });
}
