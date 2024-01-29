const {config} = require("dotenv");
require('dotenv').config();
let { PG_CONNECTION_STRING,DB_SSL,PG_PORT, COCKROACHDB_CONNECTION_STRING} = process.env;



module.exports = {
  postgres_config:{
    client: 'pg',
  connection: PG_CONNECTION_STRING,
  ssl: config[DB_SSL] ? { rejectUnauthorized: false } : false,
  },
  cockroach_config:{
    client: 'cockroachdb', // Use the PostgreSQL client
  connection:COCKROACHDB_CONNECTION_STRING,
    ssl: config[DB_SSL] ? { rejectUnauthorized: false } : false,
  }


  // pool: {
  //   min: 0,
  //   max: 10,
  // },
}


