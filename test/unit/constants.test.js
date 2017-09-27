/* eslint-env node, mocha */
'use strict';

require('should');

const CONSTANTS = require('../../src/constants');

/**
 * UNIT tests to verfiy that our constants are correct. We mainly focus on
 * the automatic creation of the *ATTRIBUTES* array which should contain
 * all attributes.
 */
describe(`CONSTANTS`, () => {
    describe(`All *ATTRIBUTES* of Family`, () => {
        it(`ATTRIBUTES_FAMILY should contain all non-internal family attributes`, () => {
            CONSTANTS.ATTRIBUTES_FAMILY.should.deepEqual(
                [
                    'familyName', 'familyDescription'
                ]
            );
        });

        it(`INTERNAL_ATTRIBUTES_FAMILY should all internal family attributes`, () => {
            CONSTANTS.INTERNAL_ATTRIBUTES_FAMILY.should.deepEqual(
                [
                    'familyId',
                    'familyCreatedAt',
                    'familyModifiedAt'
                ]
            );
        });
    });

    describe(`All *ATTRIBUTES* of Generation`, () => {
        it(`ATTRIBUTES_GENERATION should contain all non-internal generation attributes`, () => {
            CONSTANTS.ATTRIBUTES_GENERATION.should.deepEqual(
                [
                    'generationName',
                    'generationParents',
                    'generationDescription',
                    'familyId'
                ]
            );
        });

        it(`INTERNAL_ATTRIBUTES_GENERATION should all internal generation attributes`, () => {
            CONSTANTS.INTERNAL_ATTRIBUTES_GENERATION.should.deepEqual(
                [
                    'generationId',
                    'generationCreatedAt',
                    'generationModifiedAt'
                ]
            );
        });
    });

    describe(`All *ATTRIBUTES* of Genotype`, () => {
        it(`ATTRIBUTES_GENOTYPE should contain all non-internal genotype attributes`, () => {
            CONSTANTS.ATTRIBUTES_GENOTYPE.should.deepEqual(
                [
                    'genotypeName',
                    'genotypeDescription',
                    'generationId'
                ]
            );
        });

        it(`INTERNAL_ATTRIBUTES_GENERATION should all internal genotype attributes`, () => {
            CONSTANTS.INTERNAL_ATTRIBUTES_GENOTYPE.should.deepEqual(
                [
                    'genotypeId',
                    'genotypeCreatedAt',
                    'genotypeModifiedAt'
                ]
            );
        });
    });

    describe(`All *ATTRIBUTES* of Plant`, () => {
        it(`ATTRIBUTES_PLANT should contain all non-internal plant attributes`, () => {
            CONSTANTS.ATTRIBUTES_PLANT.should.deepEqual(
                [
                    'plantName',
                    'plantClonedFrom',
                    'plantSex',
                    'plantDescription',
                    'genotypeId',
                    'mediumId'
                ]
            );
        });

        it(`INTERNAL_ATTRIBUTES_PLANT should all internal genotype attributes`, () => {
            CONSTANTS.INTERNAL_ATTRIBUTES_PLANT.should.deepEqual(
                [
                    'plantId',
                    'plantCreatedAt',
                    'plantModifiedAt'
                ]
            );
        });
    });
});
