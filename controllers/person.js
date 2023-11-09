const validator = require('validator');
const knex = require('../db');


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






module.exports = {getPeople, getPerson}