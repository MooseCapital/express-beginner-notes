const express = require('express');
const router = express.Router();
const validator = require('validator');
const knex = require('../db');
const {getPeople, getPerson, getPage} = require('../controllers/person.js')

// const postgres = require('postgres');
// const {config} = require("dotenv");
// require('dotenv').config();
// const uuidValidate = require('uuid-validate');


// let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, PG_CONNECTION_STRING, DB_SSL, PG_CONNECTION_SAFE_STRING } = process.env;
// const db = knex(knexfile)
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
});
/* const knex = require('knex')({
  client: 'pg',
  connection: {
  connectionString: PG_CONNECTION_SAFE_STRING,
    host : PGHOST,
    port : 5432,
    user : PGUSER,
    password : PGPASSWORD,
    database : PGDATABASE
  },
  ssl: config["DB_SSL"] ? { rejectUnauthorized: false } : false,
});
 */




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
      400 Bad request - client side input fails validation
      401 unauthorized - means unauthenticated, This means the user isn't authorized to access a resource.
          It usually returns when the user isn't authenticated.
      403 forbidden - client does not have access rights to the content, it is unauthorized. the users identity IS known
        to the server and not the right type with access. like admin page
      404 not found - server cannot find requested resource, in the browser it means the URL is not recognized, in the api
        it can mean the endpoint is valid, but the resource itself does not exist.
        usually used in place of 403 error to hide existence of the admin page/ or resource from unauthorized clients.
      429 Too many request - user sent too many request in given time ( rate limiting)
      500 internal server error - The server has encountered a situation it does not know how to handle. generic server error
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
        req.query - get access to query search strings in url
        req.body - get data sent with request, like form data
        req.originalUrl - get url page route
        req.cookies - get cookies with cookie-parser middleware, this req contains cookies sent by the request on
        req.get() - get header fields  req.get('Content-Type') -> 'text/plain'
            req.get('host') -> same as below req.headers.host, or req.header('host')

        req.headers - is the json object, so we can access all on the object
            access individual headers -
              console.log(req.headers.host)
              const host = req.headers['host']; -> destructure



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
          res.set() - set headers and content type of response, in our rest api we will default to .json objects  https://stackoverflow.com/questions/51661744/how-to-set-content-type-when-doing-res-send
              -> here we set the header, before we send plain text
              res.set('content-type', 'text/plain');  -> or object for multiple

              res.set({'content-type': 'text/plain',
                        'Content-Length': '100',
                        'Cache-control': 'public',})

              res.send(JSON.stringify({...}));


          res.type() - like set above, type is short for res.set('content-type', _here)
                      res.type('.html')            // => 'text/html'
                      res.type('html')             // => 'text/html'
                      res.type('json')             // => 'application/json'
                      res.type('application/json') // => 'application/json'
                      res.type('png')              // => 'image/png'
                      res.type('mp3')              // => 'audio/mp3'

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

    params - when using params, the req.params.id is a string, convert to a Number(req.param.id) if we need a number

        make sure to validate uuid or id in the request, BEFORE it hits the database call. this will save lots of money and free up database resources!

            app.get('/people/:id' , async (req, res) =>
             if (!validator.isUUID(req.params.id, [4])) {
                  return res.status(500).json({error: 'could not fetch'})
            }
            const data = await knex('people').select('*').where('id', req.params.id)
            res.status(200).json(data)
        ** our routes read in order, so ALWAYS put parameters behind all hardcoded routes, if we type /people/new right now, it will run on the route above
          -> the server reads the people/:id first, and thinks new is the parameter for :id above, and it could be, so since new is hard coded, it should be above dynamic params
            -> simply remember, put ALL param routes last, so we don't get mixed up

        **Params are for REST parameters, which identify the resource being requested.
            Query parameters are used for search parameters that don't directly identify the resource, such as keywords.
        params must be a-zA-Z or 0-9, letter and number, and _ underscore, no symbols in parameters!


    Query - is mostly used for searching,sorting, filtering, pagination.. a query could replace a param, BUT we won't because you can use a query in addition
            -> to a dynamic parameter
            api/query/?name=phone
        -> we access the query data object
            const name = req.query.name.toLowerCase()
        -> see pagination in sqlNotes.js route/people?page=2
                                                                                                              https://stackoverflow.com/questions/6855624/plus-sign-in-query-string
        when we want to get special characters in a query, like a + sign for sorting up or down. we need url encoding https://www.w3schools.com/tags/ref_urlencode.asp
            http://example.com/articles?sort=+author,-datepublished  -> sort=+author,  means ascending


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


      Libraries -
            uuid-random: https://www.npmjs.com/package/uuid-random
              --> always check for optimized package alternatives, this generates uuid's 20x faster than normal package

            cacheable-lookup : https://www.npmjs.com/package/cacheable-lookup
              --> in our server can do can axios/fetch request like in react, so our api can call other apis, when we do this, our server
              -> looks at the domain and gets the ip address the nameserver points to. cacheable lookup says
              -> if we are making lots of request in our api to another domain, why not just cache the ip it must request each time
              -> even though name servers or 'dns' managers are very fast, this could save some time if we make lots of calls



        promise.All - so far each request has made 1 await request to our db, but if we are running multiple calls that don't depend on each-other, we want those to start at
            -> the same time, not start after one finished.. so promise.all will start them, then once ALL are done, we get a response.
            const [resultFunction1, resultFunction2] = await Promise.all([
                 functionThatReturnsPromise1(),
                 functionThatReturnsPromise2()
              ]);

        cron jobs - when we want to specify when to run a function every x amount of time or at x time per day/week etc.. not on user interaction
            digitalocean or others can add it for us, but we should look at packages to have it run ourself on our server https://www.npmjs.com/package/node-cron
                https://www.mickpatterson.com.au/blog/how-to-setup-scheduled-functions-with-nodejs-express-and-node-cron


        Hosting our expressjs - we can use things like paas, platform as a service.. railway, render, fly.io, digitalocean, heroku, These will make it faster at first
            and easy to setup hosting for our backend express api, but as we get more users and need to scale, our server cost on digitalocean can be 4x as much
            as learning to set up our own server on hetzner or linode.

        cache-control -headers , this lets us use the users storage to store our images and website files, so we don't hit or cdn or server every time
            -> that would waste bandwidth. this is not for the backend really, unless we use ssr, https://www.keycdn.com/support/cache-control
              -> if we use cdn and platform to host our spa website, it will handle the nginx server cache-control settings for us

        new route files - we see the app.js file imports our index.js and users.js, inside users.js, all routes start with /users
                const usersRouter = require('./routes/users');
                app.use('/users', usersRouter);
            -> app.js uses them at /users base, so inside user.js we can start all routes with basic / , and we know it starts with users

            -> we see these very long route functions, we can have our routers request, then put the callback in another controller file, and import it here
            * -> the primary setup will be a file for our routes, then export it like above, and require in app.js, then have the actual functions for that route file
                -> inside a controllers file, module.exports = {getMikeRoute}

                const  {getMikeRoute } = require('../controllers/mike.js')
                router.get("/mike",getMikeRoute);

            regex in routes - can be catfish, or dogfish..
                app.get(/.*fish$/, function (req, res) {
                });

            our await database call should always be in try..catch block so our error can flow to our catch statement, otherwise, it's not handled

            Route Examples:
                Home/index page
                  '/catalog'
                list of books, objects etc.
                  'catalog/<objects>/'
                get specific book, or item by id field info
                  'catalog/<object>/:id'
                form to create new book/item
                  'catalog/<object>/create'
                update specific item by id
                  'catalog/<object>/<id>/update'
                delete specific item by id
                  'catalog/<object>/<id>/delete'

        Dates - we may need to parse dates from our db, or make sure we are on the right timezone and location calender, luxon helps with this
                https://www.npmjs.com/package/luxon
                const { DateTime } = require("luxon");



        best practices api design -
            1) our content-type header should automatically be in json
            2) routes should be NOUNS not verbs, our http request are the verbs.. GET, POST, PUT, DELETE.
            3) use logical nesting on endpoints  -> group those that contain associated information
                  app.get('/articles/:articleId/comments'
              -> to get the author of a comment, we might look at a deeply nested route
                   /articles/:articleId/comments/:commentId/author
              -> this becomes too much to handle, so we can make another users route to get the author
                  "author": "/users/:userId"
              pagination: look at sqlNotes, we can use query's to sort as well http://example.com/articles?sort=+author,-datepublished

            4) maintain security, use ssl, have authorization in middleware for all routes, limit user privileges
            5) use cache to limit hits to the api, save resources,  something like redis, or https://www.polyscale.ai/ we've found that is very easy
            6) versioning, should be at the start of the endpoint '/v1/employees'

      Production - when putting our project into production mode from dev, we need to change some settings and security https://expressjs.com/en/advanced/best-practice-performance.html
              -> the production environment might include reverse proxy, load balancer
              Environment variables - set NODE_ENV='production'  in our .env file, it defaults to development whether we set it or not.
                  -> this can speed up our app by 3x, to make sure it is on, we can start the server this way
                    NODE_ENV=production node app.js
                  -> we must make sure our app is using our production database link, separate from dev. and that are production db has safe roles

                logging - we need to keep the morgan logger in production, it logs each request and we can make a logger file here https://github.com/expressjs/morgan#write-logs-to-a-file
                    this custom code inside app.js will help us with production logger, production gives us date/time of request!
                      if (app.get('env') === 'production') {
                        app.use(logger('combined'));
                      } else {
                        app.use(logger('dev'));
                      }
                    -> we should use the logger above and remove all console.log() statements that can affect performance

                cors - use helmet to protect against attackers https://www.npmjs.com/package/helmet
                rate limit - we should limit the times users can call our api to prevent attacks https://www.npmjs.com/package/express-rate-limit
                security - https://expressjs.com/en/advanced/best-practice-security.html

      rate limiting - https://blog.logrocket.com/rate-limiting-node-js/
            -> we must use rate limiting to prevent spam, ddos, and attacks,
            *** our limiter must be above the app.use route files like app.use('/', indexRouter);
              const {rateLimit} = require('express-rate-limit');
              const limiter = rateLimit({
                windowMs: 60 * 1000, // 15 minutes
                limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
                standardHeaders: true, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
                legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
                message: 'you are doing that too much, wait 5 minutes and try again',

                // store: ... , // Use an external store for consistency across multiple server instances.
            })
            app.use(limiter)
            app.use('/', indexRouter);

          -> if we want custom limiters for each route, we should NOT set it in app.js for all routes. we probably want
          -> a different limit for forget password, and regular api calls. etc..
          -> we can put the main limiter below some routes files to make it not useable on that folder.
            app.use('/store', storeRouter);
            app.use(limiter)
            app.use('/', indexRouter);
            app.use('/users', usersRouter);
          -> here the limiter does not apply to any routes inside the store file, so inside store I can create my own individual one
          -> we should create a new file to hold all limiters then import in app.js and all routes that need it, but for example
          -> i made it inside store.js, and this is how we use middleware in routes, testLimiter is the limiter, and test is the controller function
          router.get('/test' ,testLimiter, test)


      Forms -   for the frontend in react, we will use react-hook-forms or formik with mui
            -> The will be uncontrolled by default, so we need validation, we will try yup first, if it fails, then zod
            -> this form will have a submit function, and a post request link, which will be our expressjs backend that handles the request.
            -> we must always remember, we validate on the frontend, then again on the backend for safety. then trim and lowercase anything NOT a password, for standard format.

            React form: post should always be used for changes in the db, GET should be used for things like search
            -> we use novalidate, to turn off html validation, so zod validates only.
                <form noValidate action="/link_here/" method="post">
                  <TextField
                    name="email"
                    label="Email"
                    required
                    placeholder="example@mail.com"/>
                </form>


      Connecting frontend - in react, we will be using fetch with the http routes we know, GET, POST, PUT, DELETE..
          -> to do this we need a link to our express backend routes, but we should make this dynamic because if our server goes down
          -> we can move it over to a new link possibly, where the routes will be the same, so we use an env variable in vite/react
          -> this is a bit different than in nodejs, inside .env file
               VITE_API_LINK="http://localhost:3000"
          -> to access our .env variables in vite:
               import.meta.env.VITE_API_LINK
          *** These secrets get exposed to the client, so they are NOT safe at all, just a place to hold a stable value like state, api keys
              -> should NOT go here, our host should have a place to put our secrets for us. this is only fine for development


      CORS - when we make a request on the frontend to backend, and our api is NOT on the same domain like www.website.com/api we make cross origin request
              https://expressjs.com/en/resources/middleware/cors.html
              -> we could have our api on the same website, under a subdomain, which cors sees as completely separate.. api.website.com or apiwebsite.com
              -> we might consider using website.com/api so we don't need any cors, the website would be making request on the same domain

            configuring cors:
              const cors = require('cors')
            -> we use the website that is accessing cors below, for now it is the EXACT localhost port, future it might be api.oursite.com
              -> we can add multiple sites within an array
              corsOptions = {
              origin: ['http://localhost:5173','http://localhost:4173'],
              optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
            }
              app.use(cors(corsOptions))

      Helmet - helmet secures our Express.js server while cors allows us to make request from a different website than our server is hosted on
          -> express says helmet should almost be required for production security
              npm i helmet

              const helmet = require('helmet');
              app.use(helmet());


    Authentication - we have many options for this, some require us to have our own postgres db or they manage it for us, either way we will have our own rest api
        -> using express which we can either manage in our own vps or use digital ocean app platform at first until it gets expensive

        managed database platforms with auth are things like supabase, appwrite.io, directus.io,
            -> now we could self host these but some users report issues with supabase as they want to sell their own, but we can always try to self host appwrite or directus

        we can have our own postgres db and implement auth with things like keycloak, lucia auth, express-cookie..

        our own database where a service manages users only for us like firebase auth, clerk, auth0
            -> the main difference with this is we will NOT use this as our main apps databse with the users info, only auth
            -> and above with supabase, it's auth and a whole postgres database for everything.


*/

router.get('/', function(req, res,) {
  // res.render('index', { title: 'Express' });
  res.status(200).json({msg: 'hello world'})
});


router.get('/page' , getPage )

router.get('/people/:limit' , getPeople)

router.get('/person/:id' , getPerson)

module.exports = router;
