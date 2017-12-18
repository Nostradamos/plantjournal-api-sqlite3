/* eslint-env node, mocha */
'use strict';

const should = require('should');

const HelperFunctions = require('./helper-functions');

describe(`HelperFunctions`, () => {
  describe(`Assertion: sqlEql`, () => {
    it(`should add new Assertion to should which makes sure both sql strings are identically besides the newlines/whitespaces`, () => {
      `SELECT * FROM TEST
       WHERE foo = 'bar'
       LIMIT 1`.should.sqlEql('SELECT * FROM TEST WHERE foo = \'bar\' LIMIT 1');
    });

    it(`should fail if sql strings aren't equl`, () => {
      `SELECT * FROM asd
       WHERE foo = 'bar'
       LIMIT 1`.should.not.sqlEql('SELECT * FROM TEST WHERE foo = \'bar\' LIMIT 1');
    })
  });
});
