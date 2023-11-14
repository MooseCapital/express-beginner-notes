const express = require('express');
const router = express.Router();
const validator = require('validator');
const knex = require('../db');
const {test} = require('../controllers/inventory.js')
const {storeLimiter} = require('../rateLimits');


router.get('/test' , test)


module.exports = router;

