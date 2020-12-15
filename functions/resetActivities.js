require('../');
const Activity = require('../mongoDB/models/activity');
const IndexMap = require('../mongoDB/models/indexMap');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        await connectMongoose();
        const resActivity = await Activity.deleteMany();
        const resIndex = await IndexMap.deleteMany();
        await closeMongoose();
        console.log(
            `Removed ${resActivity.deletedCount} activities and ${resIndex.deletedCount} indexes`
        );
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();
