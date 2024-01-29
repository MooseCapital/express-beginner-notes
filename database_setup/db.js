const knex = require('knex')
const knexfile = require('./knexfile');

const db = knex(knexfile.postgres_config);
module.exports = db;
