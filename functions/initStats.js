require('../');
const Activity = require('../mongoDB/models/activity');
const Stat = require('../mongoDB/models/stat');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { calcStats } = require('../utils/calcStats');

(async () => {
    try {
        await connectMongoose();
        const activities = await Activity.find();
        const stats = calcStats(activities);
        const response = await Stat.insertMany(stats);
        await closeMongoose();
        console.log(response);
    } catch (error) {
        throw Error(error.message);
    }
})();
