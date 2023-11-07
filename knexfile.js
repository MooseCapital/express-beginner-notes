
const {config} = require("dotenv");
require('dotenv').config();
let { PRO_SAFE_STRING,DEV_SAFE_STRING,DB_SSL,} = process.env;



module.exports = {
  development:{
    client: 'pg',
  connection: {
  connectionString: DEV_SAFE_STRING,
    port : 5432,
  },
  ssl: config[DB_SSL] ? { rejectUnauthorized: false } : false,
  },
  production: {
    client: 'pg',
  connection: {
  connectionString: PRO_SAFE_STRING,
    port : 5432,
  },
  ssl: config[DB_SSL] ? { rejectUnauthorized: false } : false,

  }

}