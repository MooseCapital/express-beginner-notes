const validator = require('validator');
const knex = require('../database_setup/db');


const getPeople = (async (req, res) => {
    try {
      let dataArr = [] //array for multi records search in db
      //get validation for the param uuid

      const data = await knex('people').select('*').limit(req.params.limit);
      console.table(data)
      res.status(200).json(data)
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})

const getPerson = (async (req, res) => {
      const paramID = req.params.id
    try {
      if (!validator.isUUID(paramID, [4])) {
            res.status(500).json({msg: 'that is the wrong id'})
      }

      const data = await knex('people').select('*').where('id', paramID)
      // console.table(data)
        console.log(req.get('host'))
      res.status(200).json(data)
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})

const getPage = (async (req, res) => {
      const numId = Number(req.params.id);
      const id = req.params.id;
      const page  = req.query.page || 0;   // normalize it with req.query.name.toLowerCase() if query is text
      const rowsPerPage = 10;
      const body = req.body;
        try {
          /* if (!validator.isUUID(id, [4])) {
            return res.status(500).json({msg: 'that is the wrong id'})
          } */
          const data = await knex('people').select('*').orderBy('birthdate').offset(page * rowsPerPage).limit(rowsPerPage)
          console.table(data)
            // console.log(req.body)
          res.status(200).json(data)
        } catch (e) {
          console.log(e)
          res.status(500).json({error:'could not fetch'})
        }
})





module.exports = {getPeople, getPerson, getPage}