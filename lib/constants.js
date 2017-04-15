'use strict';
const _ = require('lodash');

const Constants = exports;

// Even if the aliases start with the default table name,
// if references the alias (which is always the default table name).
// Eg: SELECT ... FROM families `families`...
Constants.fieldAliasesFamily = {
  'familyName': 'families.familyName'
}

Constants.fieldAliasesGeneration = {
  'generationName': 'generations.generationName',
  'generationParents': 'group_concat(generation_parents.plantId) as generationParents'
}

Constants.fieldAliasesGenotype = {
  'genotypeName': 'genotypes.genotypeName'
}

Constants.fieldAliasesPlant = {
  'plantName': 'plants.plantName',
  'plantClonedFrom': 'plants.plantClonedFrom',
  'plantSex': 'plants.plantSex'
}

Constants.idFieldFamily = 'familyId';
Constants.idFieldGeneration = 'generationId';
Constants.idFieldGenotype = 'genotypeId';
Constants.idFieldPlant = 'plantId';

Constants.tableFamilies = 'families';
Constants.tableGenerations = 'generations';
Constants.tableGenerationParents = 'generation_parents';
Constants.tableGenotypes = 'genotypes';
Constants.tablePlants = 'plants';

Constants.allowedPlantSexes = ['male', 'female', 'hermaphrodite', null];

// Those we generate based on the constants defined before.
Constants.allowedFieldsFamily = _.concat(_.keys(Constants.fieldAliasesFamily), Constants.idFieldFamily);
Constants.allowedFieldsGeneration = _.concat(_.keys(Constants.fieldAliasesGeneration), Constants.idFieldGeneration);
Constants.allowedFieldsGenotype = _.concat(_.keys(Constants.fieldAliasesGenotype), Constants.idFieldGenotype);
Constants.allowedFieldsPlant = _.concat(_.keys(Constants.fieldAliasesPlant), Constants.idFieldPlant);
