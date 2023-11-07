const knex = require('knex')
const knexfile = require('./knexfile');
const {config} = require("dotenv");
require('dotenv').config();

const db = knex(knexfile.development);
module.exports = db;
