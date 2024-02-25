const {rateLimit} = require('express-rate-limit');
const ioRedis = require('ioredis');
const {RateLimiterRedis, RateLimiterMemory, RateLimiterCluster} = require('rate-limiter-flexible');
const {lookup} = require("dns-lookup-cache");

//determine what we need, if we are caching data from postgres with redis, it is obvious to pay for redis that may be $10-$30 at the start
//if we can use something free at the start like polyscale or don't need a cache, we can use memory/cluster limiter
//it is only when our server gets so big, we need a load balancer that redis limiting is needed
//it's really needed from the start because we will have a server in 2 regions for speed, but it's alright for cost efficiency

//our vps can have many issues with dns, and ioredis dns lookup is not good, so use this package to look it up
 /* let redisHostIp;
lookup(process.env.REDIS_HOST, {family: 4}, (error, address, family) => {
    console.log(`redis ip: ${address}`)
    redisHostIp = address;
});

// ioredis client setup -> can put full link before the options object ioRedis(process.env.REDIS_URL, {options})
const redisClient = new ioRedis(process.env.REDIS_URL, {
    // host: redisHostIp  || process.env.REDIS_HOST,
    // port: process.env.REDIS_PORT,
    // password: process.env.REDIS_PASSWORD,
    // username: process.env.REDIS_USER,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    connectTimeout: 20000,//20s default 10s, how long to wait before failing connection
    retryStrategy: (times) => Math.min(times * 200, 5000),//when connection is lost, t
    enableOfflineQueue: false,//fail request if redis is down, because rate limiter will go to using memory
    enableReadyCheck: true,
    // tls: {rejectUnauthorized: true}, //uncomment if using tsl/ssl
    reconnectOnError: (err) => err.message.startsWith('Redis connection lost')
});
//when redis fails, prevents console being spammed, and uses memory limiter insurance plan
//we should have alerts set up when redis is down, so no reason to spam the console
let hasLoggedError = false;
redisClient.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
        console.error('Redis connection error:', err);
    } else if (!hasLoggedError) {
        console.error('Redis connection error:', err);
        hasLoggedError = true;
    }
});
const rateLimiterMemory = new RateLimiterMemory({
    points: 5, // number of request
    duration: 60,//per second(s)
    blockDuration: 45, //time in seconds to block user after normal limit is reached
    inMemoryBlockOnConsumed: 100000, //15 amount of request within a single second, ddos prevention, will block for blockDuration
    inMemoryBlockDuration: 60 * 5, //5 mins time in seconds to block user after ddos limit is reached
    keyPrefix: 'memory-limiter:',
});

const rateLimiterRedis = new RateLimiterRedis({
    storeClient: redisClient,
    points: 100000, // Number of request
    duration: 60, // Per second(s)
    blockDuration: 45, // time in seconds to block user after normal limit is reached
    keyPrefix: 'redis-limiter:', // must be unique for limiters with different purpose
    insuranceLimiter: rateLimiterMemory, // if redis is down, use memory limiter
    inMemoryBlockOnConsumed: 100000, //15 amount of request within a single second, ddos prevention, will block for blockDuration
    inMemoryBlockDuration: 60 * 5, //5 mins time in seconds to block user after ddos limit is reached
    execEvenly: false, //spread out requests evenly
});

// issues with websockets solution: https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#websocket-single-connection-prevent-flooding
//read login endpoints protection for production, will block users spamming login attempts

const redisLimiter = async (req, res, next) => {
    //in production we will want to use some header to identify the user because users could have the same ip
    //we will use app.use(redisLimiter) to use on all routes, this pick routes here for specific limits, inside try{  }
    // if (req.path.indexOf('/users') === 0) {
    //    const pointsToConsume = req.userId ? 1 : 5;
    //    rateLimiterRedisReports.consume(key, pointsToConsume)

    //points means an authenticated user uses 1 point per request, an unauthenticated user uses way more, so its weighted
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const url = req.originalUrl; // Get the URL of the request
    const key = req.userId ? req.userId : ip;
    const redisKey = `${url}_${key}`;// Use a combination of IP and URL as the key
    const pointsToConsume = req.userId ? 1 : 1;//change to 10 in production

    //if we use redisKey, the limit is for each unique route, but if we use key, the limit applies to all routes
    try {
        await rateLimiterRedis.consume(key, pointsToConsume);
        next();
    }
    catch (rejRes) {
        if (rejRes instanceof Error) {
            // Some Redis error
            console.error(rejRes);
            res.status(500).json({message: 'Internal Server Error'});
        } else {
            // Rate limit exceeded
            const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
            res.set('Retry-After', String(secs));
            res.status(429).json({message: `You are doing that too much, wait ${secs} seconds and try again`});
        }
    }
} */
//---memory limiter rate-limiter-flexible

const memoryLimiterOptions = new RateLimiterMemory({
    points: 20, // number of request
    duration: 60,//per second(s)
    blockDuration: 60, //time in seconds to block user after normal limit is reached
    inMemoryBlockOnConsumed: 20, //15 amount of request within a single second, ddos prevention, will block for blockDuration
    inMemoryBlockDuration: 60 * 5, //5 mins time in seconds to block user after ddos limit is reached
    keyPrefix: 'memory-limiter:',
    execEvenly: false, //spread out requests evenly
});
const memoryLimiter = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    // const url = req.originalUrl; // Get the URL of the request
    const key = req.userId ? req.userId : ip;
    const pointsToConsume = req.userId ? 1 : 1;//change to 10 in production
    try {
        await memoryLimiterOptions.consume(key, pointsToConsume) // consume 2 points
        next()
    } catch (rejRes) {
         if (rejRes instanceof Error) {
            // Some Redis error
            console.error(rejRes);
            res.status(500).json({message: 'Internal Server Error'});
        } else {
            // Rate limit exceeded
            const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
            res.set('Retry-After', String(secs));
            res.status(429).json({message: `You are doing that too much, wait ${secs} seconds and try again`});
        }
    }
}

//cluster limiter rate-limiter-flexible
const clusterLimiterOptions = new RateLimiterCluster({
    keyPrefix: 'pm2clusterlimiter', // Must be unique for each limiter
    timeoutMs: 3000, // Promise is rejected, if master doesn't answer for 3 secs
    points: 100000, // number of request
    duration: 60,//per second(s)
    blockDuration: 60, //time in seconds to block user after normal limit is reached
    inMemoryBlockOnConsumed: 100000, //15 amount of request within a single second, ddos prevention, will block for blockDuration
    inMemoryBlockDuration: 60 * 5, //5 mins time in seconds to block user after ddos limit is reached
    execEvenly: false, //spread out requests evenly
});
const clusterLimiter = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    // const url = req.originalUrl; // Get the URL of the request
    const key = req.userId ? req.userId : ip;
    const pointsToConsume = req.userId ? 1 : 1;//change to 10 in production
    try {
        await clusterLimiterOptions.consume(key, pointsToConsume) // consume 2 points
        next()
    } catch (rejRes) {
         if (rejRes instanceof Error) {
            // Some Redis error
            console.error(rejRes);
            res.status(500).json({message: 'Internal Server Error'});
        } else {
            // Rate limit exceeded
            const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
            res.set('Retry-After', String(secs));
            res.status(429).json({message: `You are doing that too much, wait ${secs} seconds and try again`});
        }
    }
}

// default main limiter
const mainLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    limit: 100000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // tell user how many rate limit requests they have left
    message: (req, res) => {
        const timeLeft = Math.ceil(res.getHeader('ratelimit-reset'));
        res.status(429).json({ message: `You are doing that too much. Wait ${timeLeft} seconds and try again.` });
    },
    skipFailedRequests: false,
});
module.exports = {mainLimiter,memoryLimiter,clusterLimiter}
