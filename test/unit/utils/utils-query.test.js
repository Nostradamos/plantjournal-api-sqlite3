/* eslint-env node, mocha */
'use strict';

const should = require('should');
const squel = require('squel');

const CONSTANTS = require('../../../src/constants');
const UtilsQuery = require('../../../src/utils/utils-query');

describe(`UtilsQuery`, () => {
    describe(`#setFields()`, () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it(`should select all explicit column names of allowedAttributes if criteriaAttributes is empty`, () => {
            UtilsQuery.applyCriteriaAttributes(q, ['familyId', 'familyName'], []);
            q.toString().should.equal('SELECT families.familyId, families.familyName FROM test');
        });

        it(`should not select criteriaAttributes which are not in allowedAttributes`, () => {
            UtilsQuery.applyCriteriaAttributes(q, ['familyId', 'familyName'], ['familyId', 'notAllowed']);
            q.toString().should.equal('SELECT families.familyId FROM test');
        });

        it(`should do group_concat... for generationParents`, () => {
            UtilsQuery.applyCriteriaAttributes(q, ['generationId', 'generationParents'], ['generationParents', 'generationId']);
            q.toString().should.equal(
                'SELECT generations.generationId, (SELECT GROUP_CONCAT(generation_parents.plantId) FROM generation_parents WHERE (generation_parents.generationId = generations.generationId)) AS "generationParents" FROM test'
            );

        });
    });

    describe(`#setLimitAndOffset()`, () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it(`should set limit(options.limit) and offset(options.offset)`, () => {
            UtilsQuery.applyCriteriaLimitAndOffset(q, {'limit': 42, 'offset': 13});
            q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 13');
        });
        it(`should set limit(10) if options.limit is not set`, () => {
            UtilsQuery.applyCriteriaLimitAndOffset(q, {'offset': 13});
            q.toString().should.eql('SELECT * FROM test LIMIT 10 OFFSET 13');
        });
        it(`should set offset(0) if options.offset is not set`, () => {
            UtilsQuery.applyCriteriaLimitAndOffset(q, {'limit': 42});
            q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 0');
        });
    });

    describe(`#setSort()`, () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it(`should throw error if attribute is not in allowedAttributes`, () => {
            should(() => UtilsQuery.applyCriteriaSort(q, ['generationId'], {'sort': 'familyId ASC'}))
                .throw('Illegal attribute: familyId');
        });

        it(`should throw error if sort type is given but neither ASC nor DESC`, () => {
            should(() => UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId FOO'}))
                .throw('Illegal sort type: FOO');
        });

        it(`should not have upper cased sort type in illegal sort type error`, () => {
            should(() => UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId foO'}))
                .throw('Illegal sort type: foO');
        });

        it(`should sort ascending if no sort type (and no whitespace) is in string`, () => {
            UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' ASC`);
        });

        it(`should sort ascending if sort type is ASC`, () => {
            UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId ASC'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' ASC`);
        });

        it(`should sort descending if sort type is DESC`, () => {
            UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId DESC'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' DESC`);
        });

        it(`should uppercase sort type and not fail on lower cased sort type`, () => {
            UtilsQuery.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId desc'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' DESC`);
        });

        it(`should sort by multiple attributes if criteria.sort is an array of strings`, () => {
            UtilsQuery.applyCriteriaSort(q, ['familyId', 'generationId'], {'sort': ['familyId DESC', 'generationId']});
            q.toString().should.eql(
                `SELECT * FROM test ORDER BY 'families'.'familyId' DESC, 'generations'.'generationId' ASC`
            );
        });
    });

    describe(`#getTableOfField()`, () => {
        it(`should return "families" for any field starting with "family"`, () => {
            UtilsQuery.getTableOfField('familyId').should.eql('families');
            UtilsQuery.getTableOfField('familyName').should.eql('families');
        });

        it(`should return "generations" for any field starting with "generation" (except of generationParents)`, () => {
            UtilsQuery.getTableOfField('generationId').should.eql('generations');
            UtilsQuery.getTableOfField('generationName').should.eql('generations');
        });

        it(`should return "generation_parents" if field === "generationParents"`, () => {
            UtilsQuery.getTableOfField('generationParents').should.eql('generation_parents');
        });

        it(`should return "genotypes" for any field starting with "genotype"`, () => {
            UtilsQuery.getTableOfField('genotypeId').should.eql('genotypes');
            UtilsQuery.getTableOfField('genotypeName').should.eql('genotypes');
        });

        it(`should return "plants" for any field starting with "plant"`, () => {
            UtilsQuery.getTableOfField('plantId').should.eql('plants');
            UtilsQuery.getTableOfField('plantName').should.eql('plants');
        });

        it(`should throw error if can't resolve table`, () => {
            should(() => UtilsQuery.getTableOfField('blubbField'))
                .throw('cannot associate attribute with a table');
        });
    });

    describe(`#joinFamilies()`, () => {
        it(`should join families on familyId`, () => {
            let q = squel.select().from( CONSTANTS.TABLE_GENERATION, 'generations');

            UtilsQuery.joinFamiliesFromGenerations(q);
            q.toString().should.eql('SELECT * FROM ' +  CONSTANTS.TABLE_GENERATION +' `generations` LEFT JOIN ' + CONSTANTS.TABLE_FAMILY + ' `families` ON (generations.familyId = families.familyId)');
        });
    });

    describe(`#joinGenerations()`, () => {
        it(`should join generations and generation_parents on generationId`, () => {
            let q = squel.select().from(CONSTANTS.TABLE_GENOTYPE, 'genotypes');

            UtilsQuery.joinGenerationsAndGenerationParentsFromGenotypes(q);
            q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_GENOTYPE +' `genotypes` LEFT JOIN ' +  CONSTANTS.TABLE_GENERATION + ' `generations` ON (genotypes.generationId = generations.generationId)');
        });
    });

    describe(`#joinGenotypes()`, () => {
        it(`should join genotypes`, () => {
            let q = squel.select().from(CONSTANTS.TABLE_PLANT, 'plants');

            UtilsQuery.joinGenotypesFromPlants(q);
            q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_PLANT +' `plants` LEFT JOIN ' + CONSTANTS.TABLE_GENOTYPE + ' `genotypes` ON (plants.genotypeId = genotypes.genotypeId)');
        });
    });
});
