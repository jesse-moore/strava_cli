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
        console.log(`Inserted ${response.length} stat objects`);
    } catch (error) {
        await closeMongoose();
        console.error(error.message);
    }
})();
