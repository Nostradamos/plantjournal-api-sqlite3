/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const createTables = require('../../src/create-tables');

describe(`#createTables()`, () => {
    it(`should finish without any sql errors`, async () => {
        await sqlite.open(':memory:');
        let catched = false;

        try {
            await createTables();
        } catch (err) {
            catched = true;
        }
        catched.should.be.false();
        await sqlite.close();
    });
});
