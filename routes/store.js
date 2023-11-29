const express = require('express');
const router = express.Router();
const validator = require('validator');
const knex = require('../db');
const {test, scrapeJackpot,scrapeWinners} = require('../controllers/inventory.js')
const {storeLimiter} = require('../rateLimits');


router.get('/test' , test)
router.get('/scrapejackpot', scrapeJackpot)
router.get('/scrapewinners', scrapeWinners)

module.exports = router;

