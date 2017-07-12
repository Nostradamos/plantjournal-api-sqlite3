var db = exports;

db.sqlite = require('sqlite');

db.connect = async function(options) {
  return await db.sqlite.open(options);
};

db.close = async function() {
  await db.sqlite.close();
};
