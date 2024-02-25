const knex = require('../database_setup/db');
// const AWS = require('aws-sdk');
const {z} = require('zod');

const test = (async (req, res) => {
        const {id} = req.params;
        try {
            if (id !== undefined) {
                if (!(await z.string().uuid().safeParseAsync(id)).success ) {
                    return res.status(400).json({msg: 'that is the wrong id'})
                }
                return res.status(200).json({msg: 'id is valid'})
            }
            //socket testing





            return res.status(200).json({msg: 'test response'})
        } catch (e) {
            console.error('Error getting test:', e);
            return res.status(500).json({error: 'could not get data'})
        }
    }
)

const ip = (async (req, res) => {
    let ip = req.ip; // trust proxy sets ip to the remote client (not to the ip of the last reverse proxy server)
    if (ip.substr(0, 7) === '::ffff:') { // fix for if you have both ipv4 and ipv6
        ip = ip.substr(7);
    }

    const data = {
        ip: ip,
        protocol: req.protocol,
        headers: req.headers['x-forwarded-for'] || 'local request',
        device: req.get('User-Agent')
    }
    try {

        res.status(200).json(data);
    } catch (err) {
        // console.log("Validation errors:", err.errors)
        console.error('Error getting ip:', err);
        return res.status(500).json({error: 'could not get data'})
    }
})

const getPage = (async (req, res) => {
    //search with querys like -   http://localhost:3000/test/page/?page=2
    const page = req.query.page || 0;   // normalize it with req.query.name.toLowerCase() if query is text
    const rowsPerPage = 10;
    const body = req.body;
    try {
        const data = await knex('people').select('*').orderBy('birthdate').offset(page * rowsPerPage).limit(rowsPerPage)
        if (handleEmptyDatabase(res, data)) return; //check if database is empty
        return res.status(200).json(data)
    } catch (e) {
        console.error('Error getting pages:', e);
        return res.status(500).json({error: 'could not get data'})
    }
})
const transactionTest = (async (req, res) => {
    const numId = Number(req.params.id);
    const id = req.params.id;
    const q = req.query; //normalize with q.toLowerCase()
    if (!validator.isUUID(id, [4])) {
        return res.status(400).json({
            error: "Invalid Id"
        });
    }

    const trxProvider = knex.transactionProvider();
    const trx = await trxProvider();
    try {
        //pick what column specifically * to return, to save data we get from the database means saving $$
        const data = await trx('people').where({id: id}).update({favorite_color: 'yellow'}).returning('id');
        if (handleEmptyDatabase(res, data)) return; //check if database is empty
        await trx.commit();
        console.log(data[0]);
        return res.status(200).json(data[0]);

    } catch (e) {
        console.error(e)
        await trx.rollback();
        return res.status(500).json({Error: 'Internal server error'})
    }
})




const {
    S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    GetObjectAclCommand,
    GetObjectCommand
} = require('@aws-sdk/client-s3');
const {handleEmptyDatabase} = require("../reuseables");
const {S3_ACCESS_KEY_ID, S3_SECRET_APPLICATION_KEY, S3_ENDPOINT, S3_BUCKET_NAME} = process.env;

const s3 = new S3Client({
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_APPLICATION_KEY
    },
    endpoint: S3_ENDPOINT,
    region: 'us-east-005'
});

const streamFile = (async (req, res) => {

    try {
        const fileResponse = await s3.send(new
        GetObjectCommand({
            Bucket: S3_BUCKET_NAME, // bucket name
            Key: req.params.filename  // file name
        }));

        const fileStream = fileResponse.Body;
        res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename=wy-llc.pdf'); // Adjust filename as needed
        // res.setHeader('Content-Length', fileResponse.ContentLength || '0');

        // pipe the fileStream to the response
        fileStream.pipe(res);
    } catch (e) {
        console.error('An error occurred', e);
        return res.status(500).json({Error: `Internal server error, ${e}`})
    }
})

module.exports = {getPage, test, ip, transactionTest, streamFile}





