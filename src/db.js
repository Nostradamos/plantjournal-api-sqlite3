var db = exports;

db.sqlite = require('sqlite');

db.connect = async function connect(options) {
  return await db.sqlite.open(options);
}

db.close = async function close() {
    await db.sqlite.close();
}

db.throwErrorIfNotConnected = function() {
  
}
