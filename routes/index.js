const express = require('express');
const router = express.Router();
/* GET home page. */
const postgres = require('postgres');
const {config} = require("dotenv");
require('dotenv').config();
const uuidValidate = require('uuid-validate');
const validator = require('validator');

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, PG_CONNECTION_STRING, DB_SSL } = process.env;

/* const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
}); */
const knex = require('knex')({
  client: 'pg',
  connection: {
  connectionString: PG_CONNECTION_STRING,
    host : PGHOST,
    port : 5432,
    user : PGUSER,
    password : PGPASSWORD,
    database : PGDATABASE
  },
  ssl: config["DB_SSL"] ? { rejectUnauthorized: false } : false,
});



/* const pg = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
}); */


//Express  notes
/*
    Production mode app:
        Set the environment variable NODE_ENV to production, to run the app in production mode.


    request
    when a request is received, we get what action is needed based on the url pattern and possible information
     contained in POST or GET DATA, depending on what we need, we could write or read from the database
     The application then returns a response to the web browser, often dynamically creating an HTML page for the browser to display.
        by inserting retrieved data into placeholders in HTML template

    You can use Express middleware to add support for cookies, sessions, and users, getting POST/GET parameters, etc.

    The app.get() method specifies a callback function that will be invoked whenever there is an HTTP GET request with a path ('/') relative to the site root.

    You will want to create your own modules, because this allows you to organize your code into manageable parts —
    -> a monolithic single-file application is hard to understand and maintain.
        exports.area = (width) => width * width;

        const square = require("./square");
        square.area(4)

        we can also export with module.exports, since exports is a shortcut to module.exports object
        module.exports = {
            area(width) => width * width;
        }


*/

/*      route methods: app.get('/', ()) above
        -> checkout(),post(), copy(), delete(), get(), lock(), merge(), move(), notify(), options(), patch(), put(), search(), subscribe(), unsubscribe()
            app.all() is a special routing method, that is called in response to any HTTP method, this is used for loading middleware function
                ->at particular path for all request methods.


    responses - express provides methods to define route handlers for all other HTTP verbs,
        in our examples, we've used.  res.send() , res.status(200).json(data)


    middleware - the difference between routes, is middleware has a 3rd argument, 'next', which they are expected to call
        -> next contains the next function that must be called if they don't complete the request cycle,
        -> can be used with or without a route, app.use(a_middleware_function) -> runs for all routes and verbs
        -> middleware with a route, app.use("/someroute", a_middleware_function);
        -> if we pass an error to next() and do not handle it, the error is handled with built in error handler, it will be written to the client
            -> with stack trace, this is not included in production environment, so we MUST handle all errors
        -> when we run all routes and middleware functions and none give a response, then we need this at the bottom
            app.use((err, req, res, next) => {
              console.error(err.stack)
              res.status(500).send('Something broke!')
            })
            handle 404 responses
            app.use((req, res, next) => {
              res.status(404).send("Sorry can't find that!")
            })




        route functions end the http request-response cycle that returns a response to the HTTP client,
        middleware functions perform an operation on the request or response, then call the next function in the stack

        middleware and routing functions are called in the order they are declared, it's important if one like session middleware
        -> depends on cookie middleware, then cookie should be added first
        -> most cases middleware is added before setting routes, or route handlers will not have access to functionality added by middleware

        static files - middleware can serve static files like css, images, js, html.. this searches in the directory we input, public below
                app.use(express.static("public"))
            -> we can call it multiple times to serve multiple directories, and can specify a mount path route. like dropbox or s3 hosting our image files
                app.use("/media", express.static("public"));

        Databases - we can use the basic db driver like mongodb or postgres, to call raw queries, but we should be using ORMS
            Object Relational Mapper ("ORM") -> the ORM maps our object data to underlying database format. some people think these are just so
            you don't really have to learn sql, even though we know it, we will still use an ORM, because it's vetted efficient queries
            and to make sure we never leave any openings for an attack like sql injection.

        template engines - render data, specify structure of output document(html) in a template, using placeholders for data that will be filled
                https://strongloop.com/strongblog/compare-javascript-templates-jade-mustache-dust/
            when a page is generated. note the difference between res.send(), res.render('index')

        generator - express has a package to create all the common folders and packages we might need https://expressjs.com/en/starter/generator.html


*/


/*
    Why use express:
      used for server rendered dynamic pages that use a template, like Next.js ssr, as well as api/microservice routes for react
        -> or if we render pages on the server we can have api routes with it as well, but it can be smart to separate them so we can move hosting easily

    http response ius codes -
      100-199 - informational response
      200-299 - successful responses
      300-399 - redirection messages
      400-499 - client error responses
      500-599 - server error responses

      200 OK - request succeeded,GET fetched and transmitted in message body
        PUT or POST, HEAD
      201 Created - request succeeded, and new resource was created as a result, usually for POST or some PUT request
      400 Bad request - server can not or will not process request, due to something perceived to be client error(malformed request syntax)
        ,invalid request message framing or deceptive request routing
      401 unauthorized - means unauthenticated, client must authenticate itself to get the requested response
          unlike below, clients identity is NOT known at all, no auth
      403 forbidden - client does not have access rights to the content, it is unauthorized. the users identity IS known
        to the server and not the right type with access. like admin page
      404 not found - server cannot find requested resource, in the browser it means the URL is not recognized, in the api
        it can mean the endpoint is valid, but the resource itself does not exist.
        usually used in place of 403 error to hide existence of the admin page/ or resource from unauthorized clients.
      429 Too many request - user sent too many request in given time ( rate limiting)
      500 internal server error - The server has encountered a situation it does not know how to handle.
      502 bad gateway - while the server working as a gateway to get a response, got an invalid response
      503 service unavailable - server is not ready to handle the request, server down for maintenance that is overloaded
      504 gateway timeout - server is acting as a gateway and cannot get a response in time
      511 Network authentication required - indicates client needs to authenticate to gian network access

  middleware -
      app.use(logger) will run every time a request is made to the server
      -> is essentially between a request to the server, and the response being returned
        -> so this will run before we get our response in the route
      -> we can create middleware or use 3rd party middleware like cookie-parser, we need to be able to use cookies in routes
          -> built in middleware is something like .json() so we can read json on each route

      -> each middleware takes req,res,next , if we don't include next, then it will infinitely load and not run the route as we saw in
          -> we could put all this code in the route, we are just getting access to a parameter and running code before it hits the route, with separation
          router.param('id',(req, res,next, id) => {
            console.log(id)
            next()
          })

        Middleware without the route, will run on every single route, so we might need data or do some operation on each one
          -> this gives us the url the user made the request from
          app.use((req, res,next) => {
            console.log(req.originalURL)
            next()
          })
          * remember our middleware runs in order like routes, so if we want to use it for all routes, define the middleware function at the top of the page

      common uses for middleware -
          -> logging every single request to the console
          -> authenticator, checks if user is logged in or has permission to access the requested info route

      we can have middleware at the app level for all routes, router level for certain routes at the top.

  request - req is an object in routes and middleware, we can access data and things sent to the server https://expressjs.com/en/4x/api.html#req
        req.params.paramName - get parameters sent in url
        req.body - get data sent with request, like form data
        req.originalUrl - get url page route
        req.cookies - get cookies with cookie-parser middleware, this req contains cookies sent by the request on

  response - an object that represents the response express sends back to the user, typically use information from req to determine what to send back
        -> our server will either be an api to send data to/from the database, or be server rendered dynamic pages to send actual html files etc. https://expressjs.com/en/4x/api.html#res.json
        since our server is an api, we will not use res.send(), instead we want json data from the db and status codes to know if it worked or failed. res.status(200).json()
          res.cookie()
          res.clearCookie() -
          res.status(200).json({msg: 'hi'}) -> which tells the user success/failure http code and sends json data on the webpage
          res.send() -> we will likely never use this much because we just send data with res.json()
          res.download('path to file') -> prompt user to download a file. this is not static file hosting above with middleware, which can put an image at a url
          res.render() - render a template like html file, as we saw, likely won't use until we learn Nextjs ssr
          res.sendfile() - a txt file can be read and its text put on screen like json did, not like static file host or download prompt
          res.redirect() - send user to new link, like react router navigate(), if used for api, it can redirect to user id page get
            advanced ones to use later -
          res.location() , res.deleteCookie() - we saw, we can't log(res) because we create it, so we log the request the user makes, in our response we can do things like
            delete a users cookie

  next - if our middleware does not send a response to the user, we must call next function at the end of the middleware,
      -> this simply tells express to move on to the next middleware in the stack.


  templating engines - tool that allows you to insert variables and simple logic into your views. For instance, you could have a header that
        updates with the actual user’s name once they’ve logged in, something that is not possible with plain HTML.
       -> pug & ejs, pug has a learning curve because it doesn't look like html



  basic route handling -
    we will usually have an api for react or the frontend, or the server will be for
    app.get(),post,put,patch,delete etc. get access to params, query strings, url parts are included in the request
        middleware functions have access to the request and response object, like our cookies, we will need that in request from the user
          -> it can make changes to request/response object, end response cycle, call next middleware

    params - when using params, the req.params.id is a string, so if we compare a number id member.id === req.params.id , even if they match
      -> we will get nothing because we compare the number 4 to string "4", so we must convert it to number with Number(req.params.id) or parseInt(req.params.id)

        we make sure to validate the actual data in the route request, like with mongodb, we won't waste api calls if the url is not even in uuid format in the first place
          -> this will save many wrong calls to db and save money for us, false calls would be a huge server waste, look in testNodeRoutes.js for examples
            app.get('/people/:id' , async (req, res) =>
             if (ObjectId.isValid(req.params.id)) {
              const data = await db.collection('people').deleteOne({_id: new ObjectId(req.params.id)})
              res.status(200).json(data)
              } else {
                  res.status(500).json({error: 'could not delete document'})
              }
        ** our routes read in order, so we must ALWAYS put parameters behind all hardcoded routes, because, if we type /people/new right now, it will run on the route above
          -> the server reads the people/:id first, and thinks new is the parameter for :id above, and it could be, so since new is hard coded, it should be above dynamic params
            -> simply remember, put ALL param routes last so we don't get mixed up
             app.get('/people/new' , async (req, res) =>


      we can have our routes in their own file like we do with the express boilerplate/ pug
        app.use('/users', './routes/users'); -> we put the route base, and the link to the file in this middleware
        -> the route in users is actually /users , but we have that in use, so we can use a basic /, and it acts like /users for us without writing
          router.get('/', function(req, res, next) {
            res.send('respond with a resource');
          });

      when we do router.post() request, we are receiving json data in the server, to use this data we need the json middleware
        -> our React app or frontend would make a post request with fetch or axios from a form submit, then our server receives that
          -> and gets the submitted data in the req.body for us to use, and send to the database
        app.use(express.json()); -> express bundler did this for us
        app.use(express.urlencoded({ extended: false })); -> lets us get data from the url


      MVC - Model, view, controller - common concept in web development. It refers to the architecture of our code, it's a way to organize our aplication
          we separate our actions into 3 main components: models, views,
          controllers

          Models - basic building block of our database, every entry in our DB will have a model to hold the details of that type of entry
              -> models define the type of information that get used by views and controllers.

          Views - component that generates the ui of our app. in this case, it is express template engine pug.. usually we might have nextjs or reactjs

          Controllers - components that decides what view to display and what information is going to be put into it

        packages - uuid: https://www.npmjs.com/package/uuid-random   if we need packages we should look to see if there are optimized alternative
                -> usually there are no alternatives, but we see this uuid version generates 20x faster.







*/
/* async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result);
}

getPgVersion(); */
router.get('/', function(req, res,) {
  // res.render('index', { title: 'Express' });
  res.status(200).json({msg: 'hello world'})
});



router.get('/people/:limit' , async (req, res) => {
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
router.get('/person/:id' , async (req, res) => {
    try {
      const paramID = req.params.id
      if (uuidValidate(paramID, 4)) {
          const data = await knex('people').select('*').whereRaw('id = ?', [paramID])
          console.table(data)
          res.status(200).json(data)

      }else {
            res.status(500).json({msg: 'that is the wrong id'})
      }
    } catch (e) {
      console.log(e)
      //pick own status code and error specific to request!
      res.status(500).json({error:'could not fetch'})
    }
})


module.exports = router;
