require('../');
const mongoose = require('mongoose');
const Activity = require('../mongoDB/models/activity');
const Stat = require('../mongoDB/models/stat');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        await connectMongoose();
        await Activity.createIndexes();
        await closeMongoose();
        return;
    } catch (error) {
        throw Error(error.message);
    }
})();
