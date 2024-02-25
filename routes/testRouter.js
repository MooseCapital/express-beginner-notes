const express = require('express');
const router = express.Router();
const { test, getPage, ip, transactionTest,streamFile} = require("../controllers/testController");

/* GET users listing. */
router.get('/ip',ip)
router.get('/:id?' , test)

// router.get('/page' , getPage)
// router.get('/transaction/:id' , transactionTest)
// router.get('/streamfile/:filename',streamFile)

module.exports = router;