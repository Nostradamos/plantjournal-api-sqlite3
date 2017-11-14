/* eslint-env node, mocha */
'use strict';

require('should');

const UtilsJSON = require('../../../src/utils/utils-json');

describe(`utils/utils-json`, () => {
  describe(`#isValidJSON()`, () => {
    it(`should return true if string is valid json`, () => {
      UtilsJSON.isValidJSON('{"foo":"bar"}').should.be.true();
    });
  });

  describe(`#needToSanitize()`, () => {
    it(`should return true if obj needs to get sanitized`, () => {
      let toTest = [true, false, ['foo', 'bar']];
      for(let test of toTest) {
        UtilsJSON.needToSanitize(test).should.be.true();
      }
    });
  });

  describe(`#sanitize()`, () => {
    it(`should return JSON stringified obj`, () => {
      UtilsJSON.sanitize(true).should.eql('true');
      UtilsJSON.sanitize(['foo', 'bar']).should.eql('["foo","bar"]');
      UtilsJSON.sanitize({foo: 'bar'}).should.eql('{"foo":"bar"}');
    });

    it(`should return unmutated obj if obj doesn't need to get stringified`, () => {
      UtilsJSON.sanitize('{"foo":"bar"}').should.eql('{"foo":"bar"}');
    });
  });

  describe(`#sanitizeArray()`, () => {
    it(`should sanitize each element of the array`, () => {
      let arr = [
        true,
        false,
        {foo: 'bar'},
        '{"foo":"bar"}'
      ];

      UtilsJSON.sanitizeArray(arr).should.eql([
        'true',
        'false',
        '{"foo":"bar"}',
        '{"foo":"bar"}'
      ]);
    });
  });
});
