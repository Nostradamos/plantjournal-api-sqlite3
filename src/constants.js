'use strict';
const _ = require('lodash');

/**
 * @namespace CONSTANTS
 * @private
 */
const CONSTANTS = exports;

/**
 * CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_*
 * Associative Array containing alias as key and full field
 * (full field = with table alias, eg: families.familyName)
 * as key. We don't include the id field. (ToDo: Why?).
 * ToDo: Refactor find to not use this anymore
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

// Only aliases for createdAt fields
CONSTANTS.CREATED_AT_ALIAS_FAMILY = 'familyCreatedAt';
CONSTANTS.CREATED_AT_ALIAS_GENERATION = 'generationCreatedAt';
CONSTANTS.CREATED_AT_ALIAS_GENOTYPE = 'genotypeCreatedAt';
CONSTANTS.CREATED_AT_ALIAS_PLANT = 'plantCreatedAt';

// Only aliases for modifiedAt fields
CONSTANTS.MODIFIED_AT_ALIAS_FAMILY = 'familyModifiedAt';
CONSTANTS.MODIFIED_AT_ALIAS_GENERATION = 'generationModifiedAt';
CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE = 'genotypeModifiedAt';
CONSTANTS.MODIFIED_AT_ALIAS_PLANT = 'plantModifiedAt';

// Table names for database.
CONSTANTS.TABLE_FAMILIES = 'families';
CONSTANTS.TABLE_GENERATIONS = 'generations';
CONSTANTS.TABLE_GENERATION_PARENTS = 'generation_parents';
CONSTANTS.TABLE_GENOTYPES = 'genotypes';
CONSTANTS.TABLE_PLANTS = 'plants';

// Plant sexes. You can't pass anything else as a value for this.
// Maybe we have to extend this from time to time.
CONSTANTS.PLANT_SEXES = ['male', 'female', 'hermaphrodite', null];

/**
 * CONSTANTS.ALIASES_ONLY_*
 * Arrays containing aliases only for this model. Including id alias.
 */
CONSTANTS.ALIASES_ONLY_FAMILY = _.concat(
  _.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY),
  CONSTANTS.ID_ALIAS_FAMILY,
  CONSTANTS.CREATED_AT_ALIAS_FAMILY,
  CONSTANTS.MODIFIED_AT_ALIAS_FAMILY
);

CONSTANTS.ALIASES_ONLY_GENERATION = _.concat(
  _.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION),
   CONSTANTS.ID_ALIAS_GENERATION,
   CONSTANTS.CREATED_AT_ALIAS_GENERATION,
   CONSTANTS.MODIFIED_AT_ALIAS_GENERATION
);

CONSTANTS.ALIASES_ONLY_GENOTYPE = _.concat(
  _.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE),
  CONSTANTS.ID_ALIAS_GENOTYPE,
  CONSTANTS.CREATED_AT_ALIAS_GENOTYPE,
  CONSTANTS.MODIFIED_AT_ALIAS_GENOTYPE
);

CONSTANTS.ALIASES_ONLY_PLANT = _.concat(
  _.keys(CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_PLANT),
  CONSTANTS.ID_ALIAS_PLANT,
  CONSTANTS.CREATED_AT_ALIAS_PLANT,
  CONSTANTS.MODIFIED_AT_ALIAS_PLANT
);


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
