const validator = require('validator');
const knex = require('../db');

const test = (async (req, res) => {
      const numId = Number(req.params.id);
      const id = req.params.id;
      const page  = req.query.page || 0;   // normalize it with req.query.name.toLowerCase() if query is text
      const rowsPerPage = 10;
        try {
          // if (!validator.isUUID(id, [4])) {
          //   return res.status(500).json({msg: 'that is the wrong id'})
          // }

          // const data = await knex('')
          // console.table(data)

          // res.status(200).json(data)
            console.log(req.ip)
          res.status(200).json({msg: 'hello world'})
        } catch (e) {
          console.log(e)
          res.status(500).json({error:'could not fetch'})
        }
})

module.exports = {test}