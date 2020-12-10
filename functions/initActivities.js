require('../');
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { getAccessToken } = require('../helpers');

(async () => {
    try {
        const accessToken = await getAccessToken();
        // await connectMongoose();

        // await closeMongoose();
        console.log(accessToken);
        return;
    } catch (error) {
        console.error(error);
    }
})();
