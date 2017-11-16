/* eslint-env node, mocha */
'use strict';

const should = require('should');
const sqlite = require('sqlite');

const Utils = require('../../../src/utils/utils');

describe(`utils/utils`, () => {
  describe(`#deleteEmptyProperties()`, () => {
    it(`should mutate object to only contain non empty properties`, () => {
      Utils.deleteEmptyProperties(
        {a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}})
        .should.deepEqual({z:{a:1}});
    });

    it(`should mutate object delete non empty properties defined in  limitTo`, () => {
      Utils.deleteEmptyProperties(
        {a:{}, b:[], c:null, d:false, e:-1, f:1, z:{a:1}},
        ['a', 'b', 'c'])
        .should.deepEqual({d:false, e:-1, f:1, z:{a:1}});
    });
  });

  describe(`#throwErrorIfNotConnected()`, () => {
    it(`should throw error if sqlite is not connected`, async () => {
      if(sqlite.driver !== null) {
        try {
          await sqlite.close();
        } catch(err) {
          null;
        }
      }
      should(() => Utils.throwErrorIfNotConnected())
        .throw('plantJournal is not connected to database.');
    });

    it(`should not throw error if sqlite is connected`, async () => {
      await sqlite.open(':memory:');
      Utils.throwErrorIfNotConnected();
    });
  });

  describe(`#hasToBeIntArray()`, () => {
    it(`should throw error if object[property] is not an integer array`, () => {
      let toTest = [
        {foo: null},
        {foo: 1},
        {foo: [1,2,'4']},
      ];

      for (let tt of toTest) {
        should(() => Utils.hasToBeIntArray(tt, 'foo', 'obj'))
          .throw('obj.foo has to be an array of integers');
      }
    });

    it(`should NOT throw an error if object[property] is an integer array`, () => {
      Utils.hasToBeIntArray({foo: [-1,4,15]}, 'foo', 'obj');
    });

    it(`should NOT throw an error if object[property] is undefined`, () => {
      Utils.hasToBeIntArray({}, 'foo', 'obj');
    });
  });

  describe(`#hasToBeIntOrNull()`, () => {
    it(`should throw error if object[property] is not an integer`, () => {
      should(() => Utils.hasToBeIntOrNull({foo: '123'}, 'foo', 'obj'))
        .throw('obj.foo has to be an integer or null');
    });

    it(`should NOT throw error if object[property] is undefined`, () => {
      should(() => Utils.hasToBeIntOrNull({}, 'foo', 'obj'));
    });

    it(`should NOT throw error if object[property] is null`, () => {
      Utils.hasToBeIntOrNull({foo: null}, 'foo', 'obj');
    });

    it(`should NOT throw error if object[property] is integer`, () => {
      Utils.hasToBeIntOrNull({foo: 42}, 'foo', 'obj');
    });
  });

  describe(`#splitToInt()`, () => {
    it(`should split str by "," and cast every element to an integer`, () => {
      Utils.splitToInt('42,13').should.eql([42, 13]);
    });

    it(`should return empty array if str is null`, () => {
      Utils.splitToInt(null).should.eql([]);
    });
  });
});
