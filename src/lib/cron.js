import cron from "cron";
import https from "https";

const Job = new cron.CronJob("*/14 * * * *", function(){
    https
        .get("https://BOOKWARM-APP.com.onrender/api/register" , (res) =>{
            if(res.statusCode === 200){
                console.log("Job executed successfully");
            } else {
                console.error("Job execution failed");
            }
        })
        .on("error" , (err) => {
            console.error("Error executing job: " , err.message);
        });
});

export default Job;

//'0 0 * * *' - Daily at midnight '0 */6 * * *' - Every 6 hours '*/30 * * * *' - Every 30 minutes '0 9 * * 1-5' - Weekdays at 9 AM