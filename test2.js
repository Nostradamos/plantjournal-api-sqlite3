const Knex = require('knex');
let knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: "./mydb.sqlite"
  }
});

console.log(knex.client._formatQuery('SELECT * FROM (?)', ["asd'DROP TABLE"]));
console.log(knex.select('id').where('name', "DROP TABLE...").toString());
