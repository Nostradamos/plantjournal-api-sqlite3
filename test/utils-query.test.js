/* eslint-env node, mocha */
'use strict';

const should = require('should');
const squel = require('squel');

const CONSTANTS = require('../src/constants');
const QueryUtils = require('../src/utils-query');

describe('QueryUtils', () => {
    describe('#setFields()', () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it('should select all explicit column names of allowedAttributes if criteriaAttributes is empty', () => {
            QueryUtils.applyCriteriaAttributes(q, ['familyId', 'familyName'], []);
            q.toString().should.equal('SELECT families.familyId, families.familyName FROM test');
        });

        it('should not select criteriaAttributes which are not in allowedAttributes', () => {
            QueryUtils.applyCriteriaAttributes(q, ['familyId', 'familyName'], ['familyId', 'notAllowed']);
            q.toString().should.equal('SELECT families.familyId FROM test');
        });

        it('should do group_concat... for generationParents', () => {
            QueryUtils.applyCriteriaAttributes(q, ['generationId', 'generationParents'], ['generationParents', 'generationId']);
            q.toString().should.equal(
                'SELECT generations.generationId, group_concat(' + CONSTANTS.TABLE_GENERATION_PARENT +'.plantId) as generationParents FROM test'
            );

        });
    });

    describe('#setLimitAndOffset()', () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it('should set limit(options.limit) and offset(options.offset)', () => {
            QueryUtils.applyCriteriaLimitAndOffset(q, {'limit': 42, 'offset': 13});
            q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 13');
        });
        it('should set limit(10) if options.limit is not set', () => {
            QueryUtils.applyCriteriaLimitAndOffset(q, {'offset': 13});
            q.toString().should.eql('SELECT * FROM test LIMIT 10 OFFSET 13');
        });
        it('should set offset(0) if options.offset is not set', () => {
            QueryUtils.applyCriteriaLimitAndOffset(q, {'limit': 42});
            q.toString().should.eql('SELECT * FROM test LIMIT 42 OFFSET 0');
        });
    });

    describe('#setSort()', () => {
        let q;

        beforeEach(() => q = squel.select().from('test'));

        it('should throw error if attribute is not in allowedAttributes', () => {
            should(() => QueryUtils.applyCriteriaSort(q, ['generationId'], {'sort': 'familyId ASC'}))
                .throw('Illegal attribute: familyId');
        });

        it('should throw error if sort type is given but neither ASC nor DESC', () => {
            should(() => QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId FOO'}))
                .throw('Illegal sort type: FOO');
        });

        it('should not have upper cased sort type in illegal sort type error', () => {
            should(() => QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId foO'}))
                .throw('Illegal sort type: foO');
        });

        it('should sort ascending if no sort type (and no whitespace) is in string', () => {
            QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' ASC`);
        });

        it('should sort ascending if sort type is ASC', () => {
            QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId ASC'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' ASC`);
        });

        it('should sort descending if sort type is DESC', () => {
            QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId DESC'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' DESC`);
        });

        it('should uppercase sort type and not fail on lower cased sort type', () => {
            QueryUtils.applyCriteriaSort(q, ['familyId'], {'sort': 'familyId desc'});
            q.toString().should.eql(`SELECT * FROM test ORDER BY 'families'.'familyId' DESC`);
        });

        it('should sort by multiple attributes if criteria.sort is an array of strings', () => {
            QueryUtils.applyCriteriaSort(q, ['familyId', 'generationId'], {'sort': ['familyId DESC', 'generationId']});
            q.toString().should.eql(
                `SELECT * FROM test ORDER BY 'families'.'familyId' DESC, 'generations'.'generationId' ASC`
            );
        });
    });

    describe('#getTableOfField()', () => {
        it('should return "families" for any field starting with "family"', () => {
            QueryUtils.getTableOfField('familyId').should.eql('families');
            QueryUtils.getTableOfField('familyName').should.eql('families');
        });

        it('should return "generations" for any field starting with "generation" (except of generationParents)', () => {
            QueryUtils.getTableOfField('generationId').should.eql('generations');
            QueryUtils.getTableOfField('generationName').should.eql('generations');
        });

        it('should return "generation_parents" if field === "generationParents"', () => {
            QueryUtils.getTableOfField('generationParents').should.eql('generation_parents');
        });

        it('should return "genotypes" for any field starting with "genotype"', () => {
            QueryUtils.getTableOfField('genotypeId').should.eql('genotypes');
            QueryUtils.getTableOfField('genotypeName').should.eql('genotypes');
        });

        it('should return "plants" for any field starting with "plant"', () => {
            QueryUtils.getTableOfField('plantId').should.eql('plants');
            QueryUtils.getTableOfField('plantName').should.eql('plants');
        });

        it('should throw error if can\'t resolve table', () => {
            should(() => QueryUtils.getTableOfField('blubbField'))
                .throw('cannot associate attribute with a table');
        });
    });

    describe('#joinFamilies()', () => {
        it('should join `families` on familyId', () => {
            let q = squel.select().from( CONSTANTS.TABLE_GENERATION, 'generations');

            QueryUtils.joinFamiliesFromGenerations(q);
            q.toString().should.eql('SELECT * FROM ' +  CONSTANTS.TABLE_GENERATION +' `generations` LEFT JOIN ' + CONSTANTS.TABLE_FAMILY + ' `families` ON (generations.familyId = families.familyId)');
        });
    });

    describe('#joinGenerations()', () => {
        it('should join `generations` and `generation_parents` on generationId', () => {
            let q = squel.select().from(CONSTANTS.TABLE_GENOTYPE, 'genotypes');

            QueryUtils.joinGenerationsAndGenerationParentsFromGenotypes(q);
            q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_GENOTYPE +' `genotypes` LEFT JOIN ' +  CONSTANTS.TABLE_GENERATION + ' `generations` ON (genotypes.generationId = generations.generationId) LEFT JOIN ' + CONSTANTS.TABLE_GENERATION_PARENT +' `generation_parents` ON (generations.generationId = generation_parents.generationId)');
        });
    });

    describe('#joinGenotypes()', function () {
        it('should join `genotypes`', () => {
            let q = squel.select().from(CONSTANTS.TABLE_PLANT, 'plants');

            QueryUtils.joinGenotypesFromPlants(q);
            q.toString().should.eql('SELECT * FROM ' + CONSTANTS.TABLE_PLANT +' `plants` LEFT JOIN ' + CONSTANTS.TABLE_GENOTYPE + ' `genotypes` ON (plants.genotypeId = genotypes.genotypeId)');
        });
    });
});
