const fs = require('fs');

require('../');
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        const weatherData = readActivities();
        await connectMongoose('production');
        for (const item of weatherData) {
            const { activityId, ...data } = item;
            // if (activityId !== '5fd818d39171ea57e0d38c55') continue;
            await updateActivity(activityId, data);
            console.log(`Updated: ${activityId}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        await closeMongoose();
        console.log('Finished');
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();

async function updateActivity(id, data) {
    await Activity.updateOne({ _id: id }, { weather: data });
}

function readActivities() {
    try {
        const rawData = fs.readFileSync('./weatherDataProcessed.json', 'utf8');
        return JSON.parse(rawData).data;
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
