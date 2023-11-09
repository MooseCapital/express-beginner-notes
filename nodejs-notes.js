/*


    The "frontend" part of web development We have learned so far is made up of
      ->  HTML for markup, CSS for presentation, and JavaScript for scripting. Since we added react and can use other frameworks it seems complicated
        ,but they always spit out and compile into those 3 files, even if we're writing in JSX.
      -> user-facing aspect of web dev

    The backend part is more complicated since it can be completely different languages such as, PHP, C#, Ruby, Python and Java.
      ->  the browser does not care as long as we give it html, css and javascript for the page.
        Now we are learning nodejs because it is simply javascript outside of the browser, then nodejs will interact with an sql like database
        when we learn that in the future.
      -> handles logic and data. what the users do NOT see
      -> dynamic, webpage is generated on the fly


    Frameworks - to save us from re-writing the same code over and over, preventing repetition
        -> They provide great organization, force you to organize files and code to keep it highly modular and clean
        -> when starting a new app, you're given dozens of files already organized in a hierarchy

    Node - javascript was first designed to run in the browser only, node brought that to servers
        -> developers no longer had to use php, python, ruby, c#..
        -> node has the ability javascript does not, it can read/write local files, create http connections, and listen to network request.
        -> asynchronous, event driven runtime. Means we do NOT try to predict when things will get done, we start multiple processes/functions
            ->when those are done, it goes on to the next step, nothing ever blocks the "stack" that would only let us do one thing at a time vs starting many

    dotenv - we put sensitive information like api keys, databse logins in the .env file where noone will see it and
        it is ignored, no github upload. we need a package

        npm i dotenv
        -> in the nodejs file write :  require('dotenv').config();
        -> access variables with process.env  process.env.DATABASE_URL
        -> if we see any .env.example files in github, it is a format to help us, we copy it and put our own info



    Package.json - we have experience with this, as each project needed to, npm i -y to download all packages
        these pages show much information about each dependency, the module creators, and versions.. etc
        https://github.com/nodejs/nodejs.dev/blob/aa4239e87a5adc992fdb709c20aebb5f6da77f86/content/learn/node-js-package-manager/package-json.en.md
            npm init -y -> to create package.json
        -> local packages are in our individual project node_modules folder where as -g global installs are in our
            -> entire computer folder
        -> in general we should use local packages because using global and updating could break other projects not ready for new version.



    Non blocking I/O - nodejs can run task in parallel, which eliminates the need for multi threaded.


    Event loops - js in browser is the same as nodejs https://www.youtube.com/watch?v=8aGhZQkoFbQ
        ->  first is the "call stack" when running any code it starts off here, stackoverflow is when too many things have run and are added to the stack
            -> such as a scroll or move event listener, this runs the callback many times!
        -> code will go on the "call stack" then pop off as it is run like console.log("hi"), synchronous code will block the "call stack" as it prevents
            -> new code from running, if it synchronously takes a long time..
        ->so we make things asynchronous like setTimeout(run, 5000) -> this then gets removed from the "call stack" , then the timer
            -> goes in the "webapis", so we run the 5 sec timer above, after 5 secs it moves to the task queue
            -> the event loop checks the "call stack" to make sure it's empty, if it is, it moves items from the task queue onto the "call stack"
                -> * the great part about this, is while our async request like setTimeout is waiting on the webapis list, the callstack is now empty for other code to run

        -> * using synchronous code is called blocking because it runs on the call stack and nothing else can go until it is done, which means
            -> no buttons or interface on the web page works, the "render queue" renders the page every 16ms which would be blocked by this.
            -> by using asynchronous code, we give the render queue time to re-render between the event loop checking the task queue and running.
            ->the "render queue" can not re-render while code is running, so long synchronous code that effectively pauses our website, makes it look frozen as well.

     NPM - to download, update all and specific package read this link https://nodejs.dev/en/learn/an-introduction-to-the-npm-package-manager/
            -> this is why we include package.json in github, the user can simple, NPM install, to download all required packages easily

        when using our app in production vs development, we must remember to use an environment variable on start or edit bash files
            -> frameworks do this for us.


        Running nodejs scripts from command
            -> node (app name here) --watch(to watch it)
            -> the node --watch itself might not be as good as other modules, so we can try nodemon, to prevent re-running the app on each change
            npm i -g nodemon
            -> nodemon apptest.js

     Environment variables - uses the process core module, provides the env property, process does NOT need a "require"
        **-> these will be VERY important in the future when we need databases and sensitive credentials
        -> instead of creating env variables in tht terminal on run USER_ID=239482 USER_KEY=foobar node apptest.js
                process.env.USER_ID; // "239482"
                process.env.USER_KEY; // "foobar"
        -> we can create a .env file in the root directory of project, then use dotenv package to load them during runtime
                    # .env file
                    USER_ID="239482"
                    USER_KEY="foobar"
                    NODE_ENV="development"

        -> in the js file -> npm i dotenv
                require('dotenv').config();
                process.env.USER_ID; // "239482"

      HTTP request - The simplest way is with axios library -  https://github.com/nodejs/nodejs.dev/blob/aa4239e87a5adc992fdb709c20aebb5f6da77f86/content/learn/node-js-web-server/node-make-http-requests.en.md
        ->  npm install axios
            const axios = require('axios');
        GET Request ->

            axios.get('https://jsonplaceholder.typicode.com/posts/2')
              .then(res => {
                console.log(`statusCode: ${res.status}`);
                console.log(res);
                console.log(res.data);
              })
              .catch(error => {
                console.error(error);
              });
        POST request ->

            axios.post('https://whatever.com/todos', {
                todo: 'Buy the milk',
              })
              .then(res => {
                console.log(`statusCode: ${res.status}`);
                console.log(res);
              })
              .catch(error => {
                console.error(error);
              });

        PUT and DELETE request use the same POST request format, we only need to change the method value

      Path - we must be careful to have the right path to files, path overall is not too useful, it will simply put data we give
        it, into file path formats https://nodejs.dev/en/learn/nodejs-file-paths/
            const path = require('path');
        -> in ever nodejs file we have access to __filename and __dirname
            -> __file gives the entire directory and current file, while __dirname just gives the directory
            -> the path module can take this and get certain parts out, such as
            __filename -> /home/moose/Desktop/WebstormProjects/nodejs-beginner-notes/apptest.js
            path.basename(__filename) -> apptest.js -> file name only
            path.extname(__filename) -> .js -> file extension name

            add paths together: path.join(__dirname, 'test')
            ** -> path will NOT create files, this simply adds the path format together to input in fs modules
                -> that will actually create the files, ALSO windows vs linux will use different slash \//\
                -> by using path.join, it automates picking the slashes for us, so no issues!


      fs module - interacts with nodejs file system, no need to install, it's part of node.js core
            -> we can also run fs functions in a synchronous way to stop the thread from running, (we will probably never use)
            -> https://github.com/nodejs/nodejs.dev/blob/aa4239e87a5adc992fdb709c20aebb5f6da77f86/content/learn/node-js-modules/node-module-fs.en.md
            -> const fs = require('fs/promises'); -> only use fs/promises if using async and NOT callbacks
            -> to prevent callback hell ( many nested callbacks) we use async for promise based over callback based
                    async function example() {
                      const fileName = '/Users/joe/test.txt';
                      try {
                        const data = await fs.readFile(fileName, { encoding: 'utf8' });
                        console.log(data);
                        const content = 'Some content!';
                        await fs.writeFile(fileName, content);
                        console.log('Wrote some content!');
                        const newData = await fs.readFile(fileName, 'utf8');
                        console.log(newData);
                      } catch (err) {
                        console.log(err);
                      }
                    }
                    example();

            popular fs functions we will likely use
                -> fs.stat() - gives data on the file such as creation time, byte size(kb), isfile() t/f, isDirectory()
                -> fs.rename() - rename files

            fs open() - we have fs.readFile() and fs.writeFile() that automatically opens the file for us, BUT if we want to keep using a file
                -> we want to open the file ourselves to keep it open for performance and we can do more complicated editing to it.
                -> fs.readFile also closes it for us, so in case we forget to, most important, it reads the WHOLE file
                -> createReadStream is for processing the file in parts

            fs.readFile() - we can read file, but if we are reading big files this will impact memory and speed
                -> it is best to use read with streams for this.

            fs.writeFile() - we write a new file, or edit existing files, make sure to use the right flag to not overwrite file
                if that is what we want https://nodejs.dev/en/learn/writing-files-with-nodejs/
                we can either, overwite the entire file, append to the beginning or end. and open the file or reading/writing
               * -> we can also use .appendFile() to simply add text to the end same as writeFile, but no flags required

                    async function teststat() {
                      const fileName = './files/test.txt';
                      try {
                        const data = await fs.writeFile(fileName, "hello world", {flag: "a"})
                        console.log(data)
                      } catch (err) {
                        console.log(err);
                      }
                    }
                    teststat();

            fs.mkdir - create a folder, now add paths together easily with path.join
                    fs.mkdir(path.join(__dirname,'test1'), {}, (err) => {
                      if (err) {
                          throw err
                        console.log('folder created')
                      }
                    })

            URL class - when we want to use a url link and edit it by inputting different parts of the path, search terms hashes.
                or many other things.   https://nodejs.org/api/url.html#url_the_whatwg_url_api
                -> URL is global, we don't need to require it
                -> once the object has been created we can edit the properties on it directly or use template strings
                    const myURL = new URL('https://example.org');
                        myURL.pathname = '/a/b/c';
                        myURL.search = '?d=e';
                        myURL.hash = '#fgh';

                        const pathname = '/a/b/c';
                        const search = '?d=e';
                        const hash = '#fgh';
                    const myURL = new URL(`https://example.org${pathname}${search}${hash}`);
                -> all we need to remember is, once created a url or getting user input search terms, we can extract any parts of
                    -> that url from the object
                -> instead of putting together a url with search params and paths, we could enter one, then break it apart,
                        const myURL = new URL(`https://example.org?user=bob&age=30`);
                            myURL.host -> example.org -> simply log myURL to get all parts of the link
                -> add new search parameters to link
                    myURL.searchParams.append('name', 'gary');

        Event emitter - in javascript in the browser, we have event like onclick, but in node, it's a server with no interface. So we
            create an event, then make that happen when we decide. https://github.com/nodejs/nodejs.dev/blob/aa4239e87a5adc992fdb709c20aebb5f6da77f86/content/learn/node-js-modules/node-module-events.en.md
            const EventEmitter = require('events');
            const customEmitterName = new EventEmitter();
                -> we need to put our callback into a variable to make it be removed!!

            const logFunctionForEvent = () => {
                console.log("hello world" + param)
            }
            customEmitterName.on('customEventName', logFunctionForEvent)
                -> emit fires the event, we can pass in arguments through this for the 2nd arg.
            customEmitterName.emit("customEventName", "my name is bob") ->
                -> we see "hello world my name is bob" in the console now

            customEmitterName.eventNames() -> list all events on that emitter, current we have "customerEventName"
            customEmitterName.getMaxListeners() -> default to 10, we set higher with customEmitterName.setMaxListeners(99);

            -> to remove the event, its the opposite of how we created it with on.. off
                customEmitterName.off('customEventName', logFunctionForEvent)

            -> make event that is only ever called one time
                customEmitterName.once('newEventName', () => {
                    console.log('the pain of only getting to run once.. is so sad')
                })

            -> instead of .on() to add event, we can use prependListener() to make an event first in line,
                -> new events get added to the end of the line

            we saw how to remove a single listener above with .off(), now to remove every event of the same name..
                -> customEmitterName.removeAllListeners('customEvent') -> we can still emit customEmitterName.emit('cat')
                -> because this emitter is still active, and we can have multiple of the same event name. so cat event is still there
                -> again .off() is simply alias for .removeListener() since we can have much different code for the same event name many times..
                    -> this is why the cb must be in a variable to remove a specific event, shown above

        os - get all information about computer system and software
            os.cpus() - get array of all cpu cores and cpu model name
            os.platform() - windows, linux..
            os.freemem() - free memory/ram
            os.totalmem() - total ram - free ram = used ram
            os.uptime() - seconds system has been on

        debugging - we can simply watch our file with nodemon and use console.log() for everything.. but eventually we get hundreds of logs
            -> AND the most important part, the data can change after we have logged it, so we miss that error! this is where breakpoints come in
            go to about:inspect  in chrome
            All we have to do to set it up is a few commands
            1) node --inspect --watch filename.js -> we combined --watch and --inspect, it seems to be working
            2) in our console, we get a link like 127.0.0.1:9229 -> put that into chrome search
            3) go to chrome browser and inspect -> click the node green logo by the arrow near top bar.
                -> this opens dedicated dev tools for node
            4) we may not get normal console logs in chrome tool, so we may want to pop out our terminal that is watching logs as well, under
                -> the nodejs inspector, while the inspector is for our breakpoints in webstorm

            so tldr: run debug script, open chrome, we need to pop out debug tab because the chrome node debugger is slow to log our stuff
            so we have the chrome window on the left side, and nodejs devtools on top right, and jetbrains debug logger on bottom right.


    http -


        SQL testing in node -
            we used peoplehalf1 sql file with 200 rows. to select an id in node goes from 33.08 thousand request units to 33.16 out of 50 million
                -> we go through the setup guide and initially can run our sql file to make the table and stuff
                        (async () => {
                          await client.connect();
                          try {
                            const peoplehalf1 = FS.readFileSync(path.join(__dirname, './peoplehalf1.sql')).toString();
                            const results = await client.query(peoplehalf1);
                            console.log(results);
                          } catch (err) {
                            console.error("error executing query:", err);
                          } finally {
                            client.end();
                          }
                        })();
                -> after the table is created, re running that code gives error, so not again. now we can run querys like this
                        async function testDB() {
                          try {
                            await client.connect()
                            const results = await client.query('SELECT * FROM peoplehalf1 WHERE id = 7');
                            console.log(results.rows)
                          } catch (err) {
                            console.error("error executing query:", err);
                          }
                        }
                        testDB();




        Passwords - we can NOT store plaintext passwords in our database, we should offer 2fa for customers but
            -> also have good cryptography, this is made easy with hashing packages https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html



        NOSQL - Mongodb is typically the most popular nosql database. There are 4 broad categories of nosql
                Document stores - most popular type of nosql, looks like traditional sql but no scheme no normalization.
                graph databases - niche type of nosql, most common use is face people you may know
                key-value stores - most straightforward, holds collections of key-value pairs, perfect for caching or storing session data
                wide-column data stores - similar to key-value but a key holds access to columns. such as time series db.
                new sql - like snowflake that combines normal sql with nosql speeds

                normally we will need a combination of each and shouldn't try to make a nosql or sql db work when we need the other.
                    -> sql can now hold json data, but, mongodb is much cheaper in storage being a normal document store unlike sql that's using json
                    -> so our storage cost on a serverless sql like cockroachlabs or planetscale will be MUCH higher than on mongodb, if we just want documents
                    -> and lots of text, so use a combination!!

        Rate limit api - to prevent users from refreshing the page to spam our api and cost us lots of money & make it slower for other users. we
            can limit the amount of times they call it like 10 times a minute, then if they keep refreshing, they get an error.
            this will prevent api calls, then database calls. we can use something like an api limit package    https://www.npmjs.com/package/express-rate-limit
            https://reflectoring.io/tutorial-nodejs-rate-limiter/    -> this prevents abuse, ddos attacks, gives fair allocation and


        Nextjs - instead of vercel we can try self hosting with sst.dev or flight control, digitalocean app platform.. this lacks some easy vercel features like image optimization
                -> so we have a package to reduce image sizes https://www.npmjs.com/package/sharp


        Entire stack - if we don't use nextjs where our api is on nextjs routes.. we can simplify it by hosting our react spa on cloudfare, digitalocean or bunny.net
            -> api can be on another domain to simplify the reverse proxy on different hosting locations, nodejs hosted with heroku,railway.app or
                -> digitalocean app platform can start at $5 with auto scaling and load balancer for us so we configure nothing like a normal droplet
                -> we use api rate limiter to limit times a user can refresh page then call the api and on other calls. so we can or not use cache on simple app
                    -> simply use main postgres db and no cache with these rate limits.
            -> database could also be in app platform but another specific service like neon.tech can be better, to not have multiple services in one server
            -> this makes moving any one service very easy with minial downtime or affect to other services, such as nextjs ssr on vercel, api on digitalocean, database on neon.tech
                -> once the bandwidth becomes too much, we go to digitalocean app platform for nextjs that goes to $10 100gb, vs $40 100gb for vercel
            -> the main postgres database can be elsewhere, but to cache that db to reduce traffic.. we can host a redis cache on the app platform as well!

            -> https://k6.io/ for a load tester, make sure our resources can handle x number of users.
            -> .env secrets. we NEVER upload our private env variables, even to private repos.. so we can use things like https://www.envkey.com/
                -> or in digitalocean it should let us manually input env keys, to never expose them in our git code push.

            **-> we should always remember in production, if our database is on neon.tech, have many backups and also be signed up to services
                -> where if anything were to happen, we can be up and migrated on a new database within a short time frame
                -> same goes for the api, if digitalocean app platform were to go down, can we easily migrate to heroku or railway?

        Authentication - we can sign users in with many different ways like email/password only or others such as google/facebook/github
            *remember when deleting users, many databases simply have a column with deleted: true/false, this way we dont permanently delete a user by mistake
                -> when we need space, then we delete all users with deleted: true, and were good to go.
            -> auth comes in a few ways, either managed or self hosted/created
            -> if we might have many free users then a paid option will be expensive when clerk.com is $20/1000 users, authO, okta etc..
            -> we do NOT want to ever try google firebase auth since they increased sms cost 10kx from 10k free a day to only 10, and about .05$ per sms
            -> firebase gives 50k active users free, BUT these are also locked into googles database, and they could raise rates at any time

            * use clerk.com or paid service when we have high paying users, or lack free users/short term free users. so the saved setup auth time will be worth it
            ** READ our bookmarked folder 'node auth signin' and watch the playlist 'authentication user' to decide which option fits our budget/needs.
            * use a free setup when we might have many free users or long free trial period. There are many ways to self create auth
            * we should try to make our own auth to fully understand it, like with a simple node-session, then learn how to create a 'forget password'
                -> link, that uses our email api to send specific email to the right user, and lets them verify code to change password.
                -> the point of this is to have complete control over our data and not be locked into firebase, and not get potential HUGE surprise google bills
                -> the benefit of this is having loads of users for free and cheaper email/sms verification all by ourself.
                -> for this, we should also try to learn how to add 2fa otp codes in a qr code to verify users, and a 2fa by sms.
                -> when were done with this, we can make it a template and have easy  auth for all our cheap side projects.



                -> passports for auth are OUTDATED do not use

                -> client-sessions package, watch the videos in our user authentication playlist.   https://www.npmjs.com/package/client-sessions

                -> super tokens - paid service that can be self hosted but still have to pay per users self hosted.. oof https://supertokens.com/


            The process - first, remember ALL checking happens on the server NOT the client, this is to make things safe. a user can change client code,
                -> if we had no server side check, then the user could access and do whatever, so we must have server side validation for everything
                user signs in, if password etc.. is wrong or does not exist, the server responds with specific error.
                -> if the info is correct, the user signs in and the server responds with the right user, then gives the user a cookie
                -> now all request don't need users password, they have a cookie that gives them the authorization to access and do things

                -> deleting the cookie is the same as logging out, this is why we have a autocookiedelete extension that stops cookies tracking us
                    -> but then allow some websites we want to stay signed into.

            Authentication vs Authorization - first one is simply logging in, make sure we are a specific user, authorization is making sure only
                -> specific users can access the page we want them to access, such as our admin panel, only we want access! so we would make no one but us the admin
                Authentication  - 401 unauthorized
                authorization - 403 forbidden


        Saas starter - as we see above, simply implementing authentication is complicated or we can pay to make it easy, now add many other services
            There are services that combine these to make it easy for us, called saas starter kits or boilerplate's that combine things like payment subscriptions
            we will have a list of these in our bookmark 'Saas starter kit' and post some below, the most important thing is to find one matching our language stack and with many reviews

            https://github.com/smirnov-am/awesome-saas-boilerplates


        API testing - we have seen data from mongodb in an express route, but when we want to update, delete or other things that can't easily be seen
            -> in the browser, we need an api testing service. postman was common but got a bad reputation, now we have insomnia.rest, usebruno.com and hoppscotch.io


*  */
const express = require('express');
const app = express();
const port = 3000;


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

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

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






