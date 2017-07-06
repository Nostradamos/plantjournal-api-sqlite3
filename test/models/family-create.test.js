const should = require('should');
const plantJournal = require('../../src/pj');
const sqlite = require('sqlite');
const _ = require('lodash');
const helpers = require('../helper-functions');

describe('Family()', function() {

    describe('#create()', function() {
      let pj;

      beforeEach(async function() {
        pj = new plantJournal(':memory:');
        await pj.connect();
      });

      it('should create a new Family and return family object', async function() {
        let family = await pj.Family.create({familyName: 'testName'});
        let [familyCreatedAt, familyModifiedAt] = [family.families[1].familyCreatedAt, family.families[1].familyModifiedAt];
        familyCreatedAt.should.eql(familyModifiedAt);
        family.should.deepEqual(
          {
            families: {
              1: {
                familyId: 1,
                familyName: 'testName',
                familyCreatedAt: familyCreatedAt,
                familyModifiedAt: familyModifiedAt,
              }
            }
          }
        );
        let rows = await sqlite.all('SELECT familyId, familyName, familyCreatedAt, familyModifiedAt FROM families');
        rows.should.deepEqual([{'familyId': 1, 'familyName': 'testName', 'familyModifiedAt': familyModifiedAt, 'familyCreatedAt': familyCreatedAt}]);
      });

      it('should throw `First argument has to be an associative array` if first argument is not an object with properties/associative array', async function() {
        let tested = 0;
        for(value in [[1,2], null, 'string', 1, true, undefined]) {
          await pj.Family.create(value)
            .should.be.rejectedWith('First argument has to be an associative array');
          tested++;
        }
        tested.should.eql(6);
      });

      it('should throw `options.familyName has to be set` error if no options.familyName is provided', async function() {
        await pj.Family.create({})
          .should.be.rejectedWith('options.familyName has to be set');
      });

      it('should throw error if options.familyName is not a string', async function() {
        await pj.Family.create({'familyName': 1})
          .should.be.rejectedWith('options.familyName has to be a string');
      });

      afterEach(async function() {
        await pj.disconnect();
      });
    });
});
