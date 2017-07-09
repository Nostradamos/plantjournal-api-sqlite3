'use strict';

const _ = require('lodash');

/**
 * @namespace CONSTANTS
 * @private
 */
const CONSTANTS = exports;

// Table names for database.
CONSTANTS.TABLE_FAMILIES = 'families';
CONSTANTS.TABLE_GENERATIONS = 'generations';
CONSTANTS.TABLE_GENERATION_PARENTS = 'generation_parents';
CONSTANTS.TABLE_GENOTYPES = 'genotypes';
CONSTANTS.TABLE_PLANTS = 'plants';

CONSTANTS.ATTR_ID_FAMILY = 'familyId';
CONSTANTS.ATTR_NAME_FAMILY = 'familyName';
CONSTANTS.ATTR_CREATED_AT_FAMILY = 'familyCreatedAt';
CONSTANTS.ATTR_MODIFIED_AT_FAMILY = 'familyModifiedAt';

CONSTANTS.ATTR_ID_GENERATION = 'generationId';
CONSTANTS.ATTR_NAME_GENERATION = 'generationName';
CONSTANTS.ATTR_PARENTS_GENERATION = 'generationParents';
CONSTANTS.ATTR_CREATED_AT_GENERATION = 'generationCreatedAt';
CONSTANTS.ATTR_MODIFIED_AT_GENERATION = 'generationModifiedAt';

CONSTANTS.ATTR_ID_GENOTYPE = 'genotypeId';
CONSTANTS.ATTR_NAME_GENOTYPE = 'genotypeName';
CONSTANTS.ATTR_CREATED_AT_GENOTYPE = 'genotypeCreatedAt';
CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE = 'genotypeModifiedAt';

CONSTANTS.ATTR_ID_PLANT = 'plantId';
CONSTANTS.ATTR_NAME_PLANT = 'plantName';
CONSTANTS.ATTR_SEX_PLANT = 'plantSex';
CONSTANTS.ATTR_CLONED_FROM_PLANT = 'plantClonedFrom';
CONSTANTS.ATTR_CREATED_AT_PLANT = 'plantCreatedAt';
CONSTANTS.ATTR_MODIFIED_AT_PLANT = 'plantModifiedAt';

// Plant sexes. You can't pass anything else as a value for this.
// Maybe we have to extend this from time to time.
CONSTANTS.PLANT_SEXES = ['male', 'female', 'hermaphrodite', null];

// *****************************+
// * DONT EDIT BELOW THIS LINE *
// *****************************

/**
 *  .ATTRIBUTES_* all attributes without id, createdAt, modifiedAt bundled
 *  in an array
 * @type {String[]}
 */
CONSTANTS.ATTRIBUTES_FAMILY = [
  CONSTANTS.ATTR_NAME_FAMILY
];

CONSTANTS.ATTRIBUTES_GENERATION = [
  CONSTANTS.ATTR_NAME_GENERATION,
  CONSTANTS.ATTR_PARENTS_GENERATION,
  CONSTANTS.ATTR_ID_FAMILY
];

CONSTANTS.ATTRIBUTES_GENOTYPE = [
  CONSTANTS.ATTR_NAME_GENOTYPE,
  CONSTANTS.ATTR_ID_GENERATION
];

CONSTANTS.ATTRIBUTES_PLANT = [
  CONSTANTS.ATTR_NAME_PLANT,
  CONSTANTS.ATTR_CLONED_FROM_PLANT,
  CONSTANTS.ATTR_SEX_PLANT,
  CONSTANTS.ATTR_ID_GENOTYPE
]

CONSTANTS.INTERNAL_ATTRIBUTES_FAMILY = [
  CONSTANTS.ATTR_ID_FAMILY,
  CONSTANTS.ATTR_CREATED_AT_FAMILY,
  CONSTANTS.ATTR_MODIFIED_AT_FAMILY
];

CONSTANTS.INTERNAL_ATTRIBUTES_GENERATION = [
  CONSTANTS.ATTR_ID_GENERATION,
  CONSTANTS.ATTR_CREATED_AT_GENERATION,
  CONSTANTS.ATTR_MODIFIED_AT_GENERATION
];

CONSTANTS.INTERNAL_ATTRIBUTES_GENOTYPE = [
  CONSTANTS.ATTR_ID_GENOTYPE,
  CONSTANTS.ATTR_CREATED_AT_GENOTYPE,
  CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE
];

CONSTANTS.INTERNAL_ATTRIBUTES_PLANT = [
  CONSTANTS.ATTR_ID_PLANT,
  CONSTANTS.ATTR_CREATED_AT_PLANT,
  CONSTANTS.ATTR_MODIFIED_AT_PLANT
]

CONSTANTS.ALL_ATTRIBUTES_FAMILY = _.concat(
  CONSTANTS.ATTRIBUTES_FAMILY,
  CONSTANTS.INTERNAL_ATTRIBUTES_FAMILY
)

CONSTANTS.ALL_ATTRIBUTES_GENERATION = _.concat(
  CONSTANTS.ATTRIBUTES_GENERATION,
  CONSTANTS.INTERNAL_ATTRIBUTES_GENERATION
)

CONSTANTS.ALL_ATTRIBUTES_GENOTYPE = _.concat(
  CONSTANTS.ATTRIBUTES_GENOTYPE,
  CONSTANTS.INTERNAL_ATTRIBUTES_GENOTYPE
)

CONSTANTS.ALL_ATTRIBUTES_PLANT = _.concat(
  CONSTANTS.ATTRIBUTES_PLANT,
  CONSTANTS.INTERNAL_ATTRIBUTES_PLANT
)

CONSTANTS.RELATED_ATTRIBUTES_FAMILY = CONSTANTS.ALL_ATTRIBUTES_FAMILY;

CONSTANTS.RELATED_ATTRIBUTES_GENERATION = _(CONSTANTS.RELATED_ATTRIBUTES_FAMILY)
  .concat(CONSTANTS.ALL_ATTRIBUTES_GENERATION)
  .uniq().value();

CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE = _(CONSTANTS.RELATED_ATTRIBUTES_GENERATION)
  .concat(CONSTANTS.ALL_ATTRIBUTES_GENOTYPE)
  .uniq().value();


CONSTANTS.RELATED_ATTRIBUTES_PLANT = _(CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE)
  .concat(CONSTANTS.ALL_ATTRIBUTES_PLANT)
  .uniq().value();
