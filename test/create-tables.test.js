const should = require('should');
const createTables = require('../src/create-tables');
const sqlite = require('sqlite');

describe('#createTables()', function() {
  it('should finish without any sql errors', async function() {
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
