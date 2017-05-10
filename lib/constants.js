'use strict';
const _ = require('lodash');

const CONSTANTS = exports;

// Even if the aliases start with the default table name,
// if references the alias (which is always the default table name).
// Eg: SELECT ... FROM families `families`...
CONSTANTS.fieldAliasesFamily = {
  'familyName': 'families.familyName'
}

CONSTANTS.fieldAliasesGeneration = {
  'generationName': 'generations.generationName',
  'generationParents': 'group_concat(generation_parents.plantId) as generationParents'
}

CONSTANTS.fieldAliasesGenotype = {
  'genotypeName': 'genotypes.genotypeName'
}

CONSTANTS.fieldAliasesPlant = {
  'plantName': 'plants.plantName',
  'plantClonedFrom': 'plants.plantClonedFrom',
  'plantSex': 'plants.plantSex'
}

CONSTANTS.idFieldFamily = 'familyId';
CONSTANTS.idFieldGeneration = 'generationId';
CONSTANTS.idFieldGenotype = 'genotypeId';
CONSTANTS.idFieldPlant = 'plantId';

CONSTANTS.TABLE_FAMILIES = 'families';
CONSTANTS.TABLE_GENERATIONS = 'generations';
CONSTANTS.tableGenerationParents = 'generation_parents';
CONSTANTS.tableGenotypes = 'genotypes';
CONSTANTS.tablePlants = 'plants';

CONSTANTS.allowedPlantSexes = ['male', 'female', 'hermaphrodite', null];

// Those we generate based on the constants defined before.
CONSTANTS.allowedFieldsFamily = _.concat(_.keys(CONSTANTS.fieldAliasesFamily), CONSTANTS.idFieldFamily);
CONSTANTS.allowedFieldsGeneration = _.concat(_.keys(CONSTANTS.fieldAliasesGeneration), CONSTANTS.idFieldGeneration);
CONSTANTS.allowedFieldsGenotype = _.concat(_.keys(CONSTANTS.fieldAliasesGenotype), CONSTANTS.idFieldGenotype);
CONSTANTS.allowedFieldsPlant = _.concat(_.keys(CONSTANTS.fieldAliasesPlant), CONSTANTS.idFieldPlant);
