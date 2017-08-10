/* eslint-env node, mocha */
'use strict';

require('should');

const CONSTANTS = require('../src/constants');

/**
 * UNIT tests to verfiy that our constants are correct. We mainly focus on
 * the automatic creation of the *ATTRIBUTES* array which should contain
 * all attributes.
 */
describe('CONSTANTS', function() {
    describe('All *ATTRIBUTES* of Family', function() {
        it('ATTRIBUTES_FAMILY should contain all non-internal family attributes', function() {
            CONSTANTS.ATTRIBUTES_FAMILY.should.deepEqual(
                [
                    'familyName', 'familyDescription'
                ]
            );
        });

        it('INTERNAL_ATTRIBUTES_FAMILY should all internal family attributes', function() {
            CONSTANTS.INTERNAL_ATTRIBUTES_FAMILY.should.deepEqual(
                [
                    'familyId',
                    'familyCreatedAt',
                    'familyModifiedAt'
                ]
            );
        });
    });

    describe('All *ATTRIBUTES* of Generation', function() {
        it('ATTRIBUTES_GENERATION should contain all non-internal generation attributes', function() {
            CONSTANTS.ATTRIBUTES_GENERATION.should.deepEqual(
                [
                    'generationName',
                    'generationParents',
                    'generationDescription',
                    'familyId'
                ]
            );
        });

        it('INTERNAL_ATTRIBUTES_GENERATION should all internal generation attributes', function() {
            CONSTANTS.INTERNAL_ATTRIBUTES_GENERATION.should.deepEqual(
                [
                    'generationId',
                    'generationCreatedAt',
                    'generationModifiedAt'
                ]
            );
        });
    });

    describe('All *ATTRIBUTES* of Genotype', function() {
        it('ATTRIBUTES_GENOTYPE should contain all non-internal genotype attributes', function() {
            CONSTANTS.ATTRIBUTES_GENOTYPE.should.deepEqual(
                [
                    'genotypeName',
                    'genotypeDescription',
                    'generationId'
                ]
            );
        });

        it('INTERNAL_ATTRIBUTES_GENERATION should all internal genotype attributes', function() {
            CONSTANTS.INTERNAL_ATTRIBUTES_GENOTYPE.should.deepEqual(
                [
                    'genotypeId',
                    'genotypeCreatedAt',
                    'genotypeModifiedAt'
                ]
            );
        });
    });

    describe('All *ATTRIBUTES* of Plant', function() {
        it('ATTRIBUTES_PLANT should contain all non-internal plant attributes', function() {
            CONSTANTS.ATTRIBUTES_PLANT.should.deepEqual(
                [
                    'plantName',
                    'plantClonedFrom',
                    'plantSex',
                    'plantDescription',
                    'genotypeId'
                ]
            );
        });

        it('INTERNAL_ATTRIBUTES_PLANT should all internal genotype attributes', function() {
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
