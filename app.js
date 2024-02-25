const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testRouter = require('./routes/testRouter');
const {mainLimiter, redisLimiter, memoryLimiter, clusterLimiter} = require("./rateLimits");
const helmet = require('helmet');
const cronJobs = require('./cronJobs');
const os = require('os');
const compression = require('compression')
const createError = require('http-errors');
const cluster = require("cluster");
const app = express();
const fs = require('fs');
const {z, string} = require('zod');
// const {wss} = require('./bin/www');

//set thread size to number of cpus
process.env.UV_THREADPOOL_SIZE = `${os.cpus().length}`;
console.log('cpu threads:' + process.env.UV_THREADPOOL_SIZE)



//cors settings
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:4173', 'https://landonjolly.com', 'https://portfolio.landonjolly.com', 'https://personal.panel.landonjolly.com',
        'https://moosecapital.github.io/groceries-app-crud', 'https://moosecapital.github.io'
    ],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//middleware order
app.set('trust proxy', 1); // set # of proxies in front of app
app.use(memoryLimiter) //rate limiter to use on all routes
app.use(helmet())   //helmet for security
app.use(compression())//compress all responses

//we want to only log 400< errors to the console and to the access.log file in production
if (process.env.NODE_ENV === 'production') {
    app.use(morgan(':remote-addr - [:date[clf]] :response-time ms ":method :url HTTP/:http-version" :status bytes::res[content-length] :referrer :user-agent',
        {
            skip: function (req, res) {
                return res.statusCode < 400
            }
        }
    ));
} else {
    app.use(morgan(':remote-addr - [:date[clf]] :response-time ms ":method :url HTTP/:http-version" :status bytes::res[content-length] :referrer :user-agent'));
}
app.use(express.json()); //lets us read json
app.use(express.urlencoded({extended: true})); //lets us read body data in api requests
app.use(cookieParser()); //lets us read cookies
app.use(cors(corsOptions)) //only allows these links to access api

//Api routes
app.use('/', indexRouter);
app.use('/api/v1/test', validateApiKey, testRouter);
app.use('/api/v1/users', validateApiKey, usersRouter);

//run cron jobs
cronJobs.initScheduledJobs();

// Middleware for validating API keys.
function validateApiKey(req, res, next) {
    const validApiKeys = [process.env.API_KEY];
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
        return res.status(401).json({error: 'No API key provided'});
    }
    if (!validApiKeys.includes(apiKey)) {
        return res.status(403).json({error: 'Unauthorized'});
    }
    next();
}

//error logger - morgan doesn't log error messages, only the status code



//server all static files in /public to their path
// app.use('/', express.static(path.join(__dirname, 'public')));

// view engine setup, for serving html files/ssr, we don't need if only serving json for a rest api
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.set('view cache', true);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error response
    res.status(err.status || 500).json({error: err.message});
});

module.exports = app;

