
//run right after getting data from database, if data is empty, return 404
function handleEmptyDatabase(res, data) {
    if (data === 0 || data.length === 0) {
        return res.status(404).json({msg: 'Database error: no data found'});
    }
    return false;
}

function logError(req, errorString) {
    console.error(`${req.headers['x-forwarded-for'] || req.ip} Error: ${errorString}`);
}

// const data = await knex('people').select('*').limit(limit)
// if (handleEmptyDatabase(res, data)) return; //check if database is empty


module.exports = {handleEmptyDatabase, logError}