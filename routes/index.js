const express = require('express');
const router = express.Router();
const validator = require('validator');
const knex = require('../database_setup/db');
const {getPeople, getPerson, getPage} = require('../controllers/person.js')



router.get('/', async function(req, res,) {
  // res.render('index', { title: 'Express' });
  // res.status(200).json({msg: 'hello world'})
    res.status(200).json({msg: 'hello world'})

});



router.get('/page' , getPage )

router.get('/people/:limit' , getPeople)

router.get('/person/:id' , getPerson)

module.exports = router;
