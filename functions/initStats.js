require('../')
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');

(async () => {
    try {
        await connectMongoose();
		
		
		
        await closeMongoose();
        return;
    } catch (error) {
        throw Error(error.message);
    }
})();
