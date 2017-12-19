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
    it(`should return true if obj is not a number or a string with invalid JSON`, () => {
      let toTest = [
        true,
        false,
        ['foo', 'bar'],
        '{"foo":"bar"}',
        {foo: 'bar'},
        'test'
      ];

      for(let test of toTest) {
        UtilsJSON.needToSanitize(test).should.be.true();
      }
    });

    it(`should return false if string is not valid json and onExtract is true`, () => {
      UtilsJSON.needToSanitize('test', true).should.be.false();
    });

    it(`should return false for numbers`, () => {
      UtilsJSON.needToSanitize(1.5).should.eql(false);
      UtilsJSON.needToSanitize(42).should.eql(false);
      UtilsJSON.needToSanitize(-10).should.eql(false);
      UtilsJSON.needToSanitize(-42.120390).should.eql(false);
    });
  });

  describe(`#sanitize()`, () => {
    it(`should return JSON stringified obj`, () => {
      UtilsJSON.sanitize(true).should.eql('true');
      UtilsJSON.sanitize(['foo', 'bar']).should.eql('["foo","bar"]');
      UtilsJSON.sanitize({foo: 'bar'}).should.eql('{"foo":"bar"}');
      UtilsJSON.sanitize(1.5).should.eql(1.5);
      UtilsJSON.sanitize('{"foo":"bar"}').should.eql('"{\\"foo\\":\\"bar\\"}"');
    });

    it(`should not quote invalid JSON strings if onExtract is true`, () => {
      UtilsJSON.sanitize('{foo:bar}', true).should.eql('{foo:bar}');
      UtilsJSON.sanitize('foo', true).should.eql('foo');
    });

    it(`should quote valid JSON strings if onExtract is true`, () => {
      UtilsJSON.sanitize('{"foo":"bar"}', true)
        .should.eql('"{\\"foo\\":\\"bar\\"}"');
    });



    it(`should quote JSON if object is string and valid JSON`, () => {
      UtilsJSON.sanitize('{"foo":"bar"}').should.eql('"{\\"foo\\":\\"bar\\"}"');
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
        '"{\\"foo\\":\\"bar\\"}"'
      ]);
    });
  });

  describe(`#parseIfPossible()`, () => {
    it(`should return parsed JSON if passed string is valid`, () => {
      UtilsJSON.parseIfPossible('{"foo":"bar"}').should.eql({foo: 'bar'});
    });

    it(`should return unparsed string if string is invalid`, () => {
      UtilsJSON.parseIfPossible('{"foo":"bar}').should.eql('{"foo":"bar}');
    });
  });
});
