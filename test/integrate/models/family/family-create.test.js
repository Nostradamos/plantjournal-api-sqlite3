/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');

describe(`Family()`, () => {

  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
    });

    afterEach(async () => {
      await pj.disconnect();
    });

    it(`should throw 'First argument has to be an associative array' if first argument is not an object with properties/associative array`, async () => {
      let tested = 0;

      let toTest = [
        [1,2],
        null,
        'string',
        1,
        true,
        undefined
      ];
      for (let value in toTest) {
        await pj.Family.create(value)
          .should.be.rejectedWith('First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it(`should throw 'options.familyName has to be set' error if no options.familyName is provided`, async () => {
      await pj.Family.create({})
        .should.be.rejectedWith('options.familyName has to be set');
    });

    it(`should throw error if options.familyName is not a string`, async () => {
      await pj.Family.create({familyName: 1})
        .should.be.rejectedWith('options.familyName has to be a string');
    });

    it(`should create a new Family and return family object`, async () => {
      let family = await pj.Family.create({familyName: 'testName'});
      let [familyCreatedAt, familyModifiedAt] = [
        family.families[1].familyCreatedAt,
        family.families[1].familyModifiedAt
      ];

      familyCreatedAt.should.eql(familyModifiedAt);
      family.should.deepEqual(
        {
          families: {
            1: {
              familyId: 1,
              familyName: 'testName',
              familyDescription: '',
              familyGenerations: [],
              familyCreatedAt: familyCreatedAt,
              familyModifiedAt: familyModifiedAt
            }
          }
        }
      );

      let rows = await sqlite.all('SELECT * FROM families');
      family.families[1].should.containDeep(rows[0]);
    });

    it(`should set familyDescription on create`, async () => {
      let family = await pj.Family.create(
        {
          familyName: 'testName3',
          familyDescription: 'This is a test family'
        }
      );

      family.families[1].should.containDeep(
        {
          familyId: 1,
          familyName: 'testName3',
          familyDescription: 'This is a test family',
          familyGenerations: []
        }
      );
      let rows = await sqlite.all('SELECT * FROM families');
      family.families[1].should.containDeep(rows[0]);
    });
  });
});
