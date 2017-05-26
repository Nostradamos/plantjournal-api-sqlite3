const should = require('should');
const plantJournal = require('../../src/pj');
const sqlite = require('sqlite');
const _ = require('lodash');
const helpers = require('../helper-functions');

describe('Family()', function() {
    describe('#find()', function() {
      let pj;
      let createdAt = [];
      let modifiedAt = [];

      before(async function() {
        pj = new plantJournal(':memory:');
        await pj.connect();
        await pj.Family.create({familyName: 'test1'});
        await pj.Family.create({familyName: 'testB'});
        await pj.Family.create({familyName: 'test3'});
        await pj.Family.create({familyName: 'testD'});
      });

      it('should return all families', async function() {
        let families = await pj.Family.find();
        families.should.containDeep({
          found: 4,
          remaining: 0,
          families: {
            '1': { familyId: 1, familyName: 'test1' },
            '2': { familyId: 2, familyName: 'testB' },
            '3': { familyId: 3, familyName: 'test3' },
            '4': { familyId: 4, familyName: 'testD' }
          }
        });
        helpers.allFamiliesShouldHaveCreatedAtAndModifiedAtFields(families);
      });

      it('should only return the first two families if options.limit=2', async function() {
        let families = await pj.Family.find({limit: 2, fields: ['familyId', 'familyName']});
        families.should.deepEqual({
          found: 4,
          remaining: 2,
          families: {
            '1': { familyId: 1, familyName: 'test1' },
            '2': { familyId: 2, familyName: 'testB' }
          }
        });
      });

      it('should only return the the last two families if options.offset=2 and options.limit=2', async function() {
        let families = await pj.Family.find({offset: 2, limit: 2, fields: ['familyId', 'familyName']});
        families.should.deepEqual({
          found: 4,
          remaining: 0,
          families: {
            '3': { familyId: 3, familyName: 'test3' },
            '4': { familyId: 4, familyName: 'testD' }
          }
        });
      });

      // ToDo: Improve fields, change this test
      /*it('should only return fields specified in options.fields', async function() {
        let families = await pj.Family.find({fields: ['familyName']});
        families.should.deepEqual({
          families: {
            '1': { familyName: 'test1' },
            '2': { familyName: 'testB' },
            '3': { familyName: 'test3' },
            '4': { familyName: 'testD' }
          }
        })
      });*/

      it('should only return families where options.where.ALLOWEDATTRIBUTENAME = SOMEINTEGER matches extactly', async function() {
        let families = await pj.Family.find(
          {
            where : {
              'familyId': 3
            },
            fields: ['familyId', 'familyName']
          }
        );
        families.should.deepEqual({
          found: 1,
          remaining: 0,
          families: {
            '3': { familyId: 3, familyName: 'test3' }
          }
        });
      });

      it('should only return families where options.where.ALLOWEDATTRIBUTENAME = SOMESTRING matches extactly', async function() {
        let families = await pj.Family.find(
          {
            where : {
              'familyName': 'testD'
            },
            fields: ['familyId', 'familyName']
          }
        );
        families.should.deepEqual({
          found: 1,
          remaining: 0,
          families: {
            '4': { familyId: 4, familyName: 'testD' }
          }
        });
      });

      after(async function() {
        await pj.disconnect();
      })
    });
});