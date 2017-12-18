
/* eslint-env node, mocha */
'use strict';

const CONSTANTS = require('../../../src/constants');
const UtilsChildAttributes = require(
  '../../../src/utils/utils-child-attributes');

describe(`utils/utils-child-attributes`, () => {
  describe('#isChildAttribute()', () => {
    it(`should return true for familyGenerations`, () => {
      UtilsChildAttributes
        .isChildAttribute(CONSTANTS.ATTR_GENERATIONS_FAMILY)
        .should.be.true();
    });

    it(`should return false for familyId`, () => {
      UtilsChildAttributes
        .isChildAttribute(CONSTANTS.ATTR_ID_FAMILY)
        .should.be.false();
    });

  });
});
