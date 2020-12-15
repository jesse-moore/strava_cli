require('../');
const Stat = require('../mongoDB/models/stat');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        await connectMongoose();
        const res = await Stat.deleteMany();
        await closeMongoose();
        console.log(`Removed ${res.deletedCount} stat documents`);
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();
