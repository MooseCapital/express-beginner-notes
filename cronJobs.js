const cron = require('node-cron');
const {test} = require("./controllers/inventory");


const initScheduledJobs = () => {
      const testJob = cron.schedule("1 * * * *", () => {
        console.log("cron test");
        // runs every 1 minute, if we put ("1 * * * * *") -> it would run every time on 1 second of every minute, so each minute
            //-> to run every second we would do "*/1 * * * * *"
      });
      testJob.start();
   /*
    const LotteryJob = cron.schedule("0 *!/1 * * *", async () => {
        //correct schedule " 0 *!/1 * * *"
        console.log("cron lottery job");
        try {
            const URL = `${process.env.API_LINK}/lottery/scrapeLottery`;
            const headers = {
                "x-api-key": process.env.API_KEY
            }
            await axios.get(URL, {headers})
        }
        catch (e) {
            console.error('error making request:', e)
        }
    });
    LotteryJob.start();
    */

}

module.exports = {initScheduledJobs}