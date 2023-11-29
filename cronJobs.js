const cron = require('node-cron');
const {test} = require("./controllers/inventory");


const initScheduledJobs = () => {
      const testJob = cron.schedule("1 * * * *", () => {
        console.log("cron test");
        // runs every 1 minute, if we put ("1 * * * * *") -> it would run every time on 1 second of every minute, so each minute
            //-> to run every second we would do "*/1 * * * * *"
      });
      testJob.start();


}

module.exports = {initScheduledJobs}