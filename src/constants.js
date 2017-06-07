'use strict';
const _ = require('lodash');

const CONSTANTS = exports;

/**
 * CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_*
 * Associative Array containing alias as key and full field
 * (full field = with table alias, eg: families.familyName)
 * as key. We don't include the id field. (ToDo: Why?).
 */
CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY = {
  'familyName': 'families.familyName',
  'familyCreatedAt': 'families.familyCreatedAt',
  'familyModifiedAt': 'families.familyModifiedAt'
}

CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION = {
  'generationName': 'generations.generationName',
  'generationParents': 'group_concat(generation_parents.plantId) as generationParents',
  'generationCreatedAt': 'generations.generationCreatedAt',
  'generationModifiedAt': 'generations.generationModifiedAt'
}

CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE = {
  'genotypeName': 'genotypes.genotypeName',
  'genotypeCreatedAt': 'genotypes.genotypeCreatedAt',
  'genotypeModifiedAt': 'genotypes.genotypeModifiedAt',
}

CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_PLANT = {
  'plantName': 'plants.plantName',
  'plantClonedFrom': 'plants.plantClonedFrom',
  'plantSex': 'plants.plantSex',
  'plantCreatedAt': 'plants.plantCreatedAt',
  'plantModifiedAt': 'plants.plantModifiedAt',
}

// Only aliases for id fields.
CONSTANTS.ID_ALIAS_FAMILY = 'familyId';
CONSTANTS.ID_ALIAS_GENERATION = 'generationId';
CONSTANTS.ID_ALIAS_GENOTYPE = 'genotypeId';
CONSTANTS.ID_ALIAS_PLANT = 'plantId';

// Table names for database.
CONSTANTS.TABLE_FAMILIES = 'families';
CONSTANTS.TABLE_GENERATIONS = 'generations';
CONSTANTS.TABLE_GENERATION_PARENTS = 'generation_parents';
CONSTANTS.TABLE_GENOTYPES = 'genotypes';
CONSTANTS.TABLE_PLANTS = 'plants';

// Plant sexes. You can't pass anything else as a value for this.
// Maybe we have to extend this from time to time.
CONSTANTS.PLANT_SEXES = ['male', 'female', 'hermaphrodite', null];

// ToDo: Is this used anywhere?
CONSTANTS.FIELD_CREATED_AT = 'createdAt';
CONSTANTS.FIELD_MODIFIED_AT = 'modifiedAt';

/**
 * CONSTANTS.ALIASES_ONLY_*
 * Arrays containing aliases only for this model. Including id alias.
 */
CONSTANTS.ALIASES_ONLY_FAMILY = _.concat(_.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY), CONSTANTS.ID_ALIAS_FAMILY);
CONSTANTS.ALIASES_ONLY_GENERATION = _.concat(_.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION), CONSTANTS.ID_ALIAS_GENERATION);
CONSTANTS.ALIASES_ONLY_GENOTYPE = _.concat(_.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE), CONSTANTS.ID_ALIAS_GENOTYPE);
CONSTANTS.ALIASES_ONLY_PLANT = _.concat(_.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_PLANT), CONSTANTS.ID_ALIAS_PLANT);


/**
 * ALIASES_ALL_*
 * Arrays containing aliases for this model and all backwards referenced models.
 * Eg. Family is only Family, Generation is Generation and Family, Genotype is
 * Genotype, Generation and Family...
 */
CONSTANTS.ALIASES_ALL_FAMILY = CONSTANTS.ALIASES_ONLY_FAMILY;
CONSTANTS.ALIASES_ALL_GENERATION = _.concat(CONSTANTS.ALIASES_ALL_FAMILY, CONSTANTS.ALIASES_ONLY_GENERATION);
CONSTANTS.ALIASES_ALL_GENOTYPE = _.concat(CONSTANTS.ALIASES_ALL_GENERATION, CONSTANTS.ALIASES_ONLY_GENOTYPE);
CONSTANTS.ALIASES_ALL_PLANT = _.concat(CONSTANTS.ALIASES_ALL_GENOTYPE, CONSTANTS.ALIASES_ONLY_PLANT);
