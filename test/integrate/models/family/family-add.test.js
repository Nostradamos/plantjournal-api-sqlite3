/* eslint-env node, mocha */
'use strict';

require('should');
const plantJournal = require('../../../../src/plant-journal');
const CONSTANTS = require('../../../../src/constants');


describe(`Family()`, () => {

  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal({
        client: 'sqlite3',
        connection: {
          filename: ":memory:"
        }
      });
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
        await pj.Family.add(value)
          .should.be.rejectedWith('First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it(`should throw 'options.familyName has to be set' error if no options.familyName is provided`, async () => {
      await pj.Family.add({})
        .should.be.rejectedWith('options.familyName has to be set');
    });

    it(`should throw error if options.familyName is not a string`, async () => {
      await pj.Family.add({familyName: 1})
        .should.be.rejectedWith('options.familyName has to be a string');
    });

    it(`should create a new Family and return family object`, async () => {
      let family = await pj.Family.add({familyName: 'testName'});
      let [familyAddedAt, familyModifiedAt] = [
        family.families[1].familyAddedAt,
        family.families[1].familyModifiedAt
      ];

      familyAddedAt.should.eql(familyModifiedAt);
      family.should.deepEqual(
        {
          families: {
            1: {
              familyId: 1,
              familyName: 'testName',
              familyDescription: '',
              familyGenerations: [],
              familyAddedAt: familyAddedAt,
              familyModifiedAt: familyModifiedAt
            }
          }
        }
      );

      let rows = await pj.knex(CONSTANTS.TABLE_FAMILY).select('*');
      family.families[1].should.containDeep(rows[0]);
    });

    it(`should set familyDescription on create`, async () => {
      let family = await pj.Family.add(
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
      let rows = await pj.knex(CONSTANTS.TABLE_FAMILY).select('*');
      family.families[1].should.containDeep(rows[0]);
    });
  });
});
