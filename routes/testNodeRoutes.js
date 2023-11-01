//app.js
const axios = require('axios');
const fs = require('fs/promises');
const FS = require('fs');
const fsSync = require('fs');
const path = require('path');
// const nodemailer = require('nodemailer');
const EventEmitter = require('events');
const os = require("os");
const http = require("http");
const {readHTML} = require("./paths");
const uuid = require("uuid");
const eventEmitter = new EventEmitter();
require('dotenv').config();
const express = require('express');
const app  = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
/*
const { Client } = require("pg");
const client = new Client(process.env.DATABASE_URL);
client.connect() */
// const {connectToDb, getDb} = require('./db');
const {get} = require("axios");

//for express post request
app.use(express.json())



const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'app';
const collection_name = 'people';
const peopleCollection = client.db(dbName).collection(collection_name);
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
  } catch (e) {
    console.log(`we have an error, oops: ${e}`)
    await client.close();
  }
  finally {
    // Ensures that the client will close when you finish/error
  }
}
connectToDatabase();

//mongodb in Node.js api with promises, no async/await
/* app.get('/people', (req, res) => {
  let books = []
  //in node the mongodb query must add its results to an array, unlike postgres where we had it prebuilt
    //if we findOne, we don't need an array, we just get the data, this is how we group big data
  const data = db.collection('people').find().limit(2).forEach(book => books.push(book))
      .then(() => {
          res.status(200).json(books)
      })
      .catch(() => {
          res.status(500).json({error: 'could not fetch documents'})
      })
  console.log(data)
}) */

//async way, we get the SAME response as above
//pagination, queries to limit number of query results, in api tester we use params http://localhost:3000/people?p=2  for page 2 results
app.get('/people', async (req, res) => {
    try {
      //p is query name, or 0 , means if they give no query number, default is zero.
      const page  = req.query.p || 0;
      //we must specify this because when we pick page, we do math to skip x number of people
      const peoplePerPage = 4;

      let people1 = []
      //user specifies what page, so we skip x num of people since we know people on each page, then
      //that gets us to our page we want, then limit to the peopleperpage
      const data = await db.collection('people').find().skip(page * peoplePerPage).limit(peoplePerPage).forEach(person => people1.push(person))
      res.status(200).json(people1)
    } catch (e) {
      console.log(e)
      res.status(500).json({error: 'could not fetch documents'})
    }
})

//searching database with id in route link
app.get('/people/:id' , async (req, res) => {
    try {
      //Object id is specific format of text/num if user inputs wrong amount, then we want to not even search
      if (ObjectId.isValid(req.params.id)) {
        //from the request, we can get parameters and search strings above and inputted below
        const data = await db.collection('people').findOne({_id: new ObjectId(req.params.id)})
        //if format is correct but NOT in the database
        if (data == null) {
           return res.status(404).json({error: 'not found'})
        }
        res.status(200).json(data)
        //when format is wrong altogether, it would be a massive waste to call the database every time the basic search is wrong format
      } else {
          res.status(500).json({error: 'not valid object id'})
      }
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})

//create request to db
app.post('/peoplecreate', async (req, res) => {
    try {
        const person = req.body;
        const data = await db.collection('people').insertOne(person);
        res.status(201).json(data)
    } catch (e) {
        res.status(500).json({error: 'could not create document'})
    }
})
//delete request for specific id
app.delete('/peopledelete/:id' , async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
          const data = await db.collection('people').deleteOne({_id: new ObjectId(req.params.id)})
          res.status(200).json(data)
          //when format is wrong altogether, it would be a massive waste to call the database every time the basic search is wrong format
      } else {
          res.status(500).json({error: 'could not delete document'})
      }
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})

//update request, makes request like post, so we need req.body
app.patch('/update/:id' , async (req, res) => {
    try {
      const updates = req.body;
      if (ObjectId.isValid(req.params.id)) {
        const data = await db.collection('people').updateOne({_id: new ObjectId(req.params.id)},{$set: updates})
        //note we have 2 args, unlike the others, we now need info to update, it will be here!
        res.status(200).json(data)
      } else {
          res.status(500).json({error: 'could not update document'})
      }
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})
