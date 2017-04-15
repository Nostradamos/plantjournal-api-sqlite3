'use strict';
const _ = require('lodash');

const Constants = exports;

Constants.fieldAliasesFamily = {
  'familyName': 'families.familyName'
}

Constants.fieldAliasesGeneration = {
  'generationName': 'generations.generationName',
  'generationParents': 'group_concat(generation_parents.plantId) as generationParents'
}

Constants.fieldAliasesPhenotype = {
  'phenotypeName': 'phenotypes.phenotypeName'
}

Constants.fieldAliasesPlant = {
  'plantName': 'plants.plantName'
}

Constants.idFieldFamily = 'familyId';
Constants.idFieldGeneration = 'generationId';
Constants.idFieldPhenotype = 'phenotypeId';
Constants.idFieldPlant = 'plantId';

Constants.tableFamilies = 'families';
Constants.tableGenerations = 'generations';
Constants.tableGenerationParents = 'generation_parents';
Constants.tablePhenotypes = 'phenotypes';
Constants.tablePlants = 'plants';

// Those we generate based on the constants defined before.
Constants.allowedFieldsFamily = _.concat(_.keys(Constants.fieldAliasesFamily), Constants.idFieldFamily);
Constants.allowedFieldsGeneration = _.concat(_.keys(Constants.fieldAliasesGeneration), Constants.idFieldGeneration);
Constants.allowedFieldsPhenotype = _.concat(_.keys(Constants.fieldAliasesPhenotype), Constants.idFieldPhenotype);
Constants.allowedFieldsPlant = _.concat(_.keys(Constants.fieldAliasesPlant), Constants.idFieldPlant);
