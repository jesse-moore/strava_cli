require('../');
const Activity = require('../mongoDB/models/activity');
const fs = require('fs');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        await connectMongoose('production');
        const activities = await findActivities({ year: 2020 });
        await closeMongoose();
        await saveActivities(activities);
        console.log(`Saved activities`);
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();

const findActivities = async ({ year, month }) => {
    try {
        const args = {};
        if (year) args.year = year;
        if (month) args.month = month;
        return await Activity.find(args);
    } catch (error) {
        throw Error(error.message);
    }
};

async function saveActivities(data) {
    try {
        fs.writeFileSync('./activities.json', JSON.stringify(data));
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
