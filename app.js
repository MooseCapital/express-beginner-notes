const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const storeRouter = require('./routes/store');
const {mainLimiter} = require("./rateLimits");
const helmet = require('helmet');
const cronJobs = require('./cronJobs');

const app = express();

//cors settings
corsOptions = {
  origin: ['http://localhost:5173','http://localhost:4173'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// myLogger is a custom version of logger, we don't need it
// app.use(myLogger)
//logs request to server
if (app.get('env') === 'production') {
  app.use(logger('combined'));
} else {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(cors(corsOptions))



//if we want to customize rate limits on routes, put the routes above the limiter middleware, otherwise leave below for main limiter
app.use(mainLimiter)
app.use('/store', storeRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

cronJobs.initScheduledJobs();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
/* function myLogger(req, res, next) {
  console.log("Request IP: " + req.ip);
  console.log("Request Method: " + req.method);
  console.log("Request date: " + new Date());

  next(); // THIS IS IMPORTANT!
} */




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
