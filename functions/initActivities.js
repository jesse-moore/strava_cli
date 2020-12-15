const axios = require('axios');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
require('../');
const Activity = require('../mongoDB/models/activity');
const IndexMap = require('../mongoDB/models/indexMap');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { getAccessToken } = require('../helpers');

(async () => {
    try {
        const activities = await fetchActivitiesFromStrava();
        await connectMongoose();
        const { validActivities, index } = processActivities(activities);
        await new IndexMap({ of: 'strava_id', index }).save();
        const { insertedCount } = await insertManyActivities(validActivities);
        await closeMongoose();
        console.log(`Inserted ${insertedCount} activities`);
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();

const baseURL = 'https://www.strava.com/api/v3/';

function processActivities(activities, index = new Map()) {
    const validActivities = [];
    const invalidActivities = [];
    activities.forEach((activity) => {
        if (typeof activity.id !== 'number' || index.has(activity.id.toString())) return;
        activity.strava_id = activity.id;
        const newActivity = new Activity(activity);
        const error = newActivity.validateSync();
        if (error) {
            invalidActivities.push({ error: error.message, strava_id: newActivity.strava_id });
        } else {
            index.set(newActivity.strava_id.toString(), newActivity.id);
            validActivities.push(newActivity);
        }
    });
    return { validActivities, invalidActivities, index };
}

async function fetchActivitiesFromStrava() {
    const accessToken = await getAccessToken();
    const activitiesArray = [];
    let page = 1;
    do {
        const activities = await fetchActivities(accessToken, page);
        if (activities.length === 0) break;
        activitiesArray.push(...activities);
        page++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
    } while (page < 1);
    return activitiesArray;
}

async function fetchActivities(accessToken, page) {
    const perPage = 2;
    const url = `${baseURL}athlete/activities?per_page=${perPage}&page=${page}`;
    try {
        const response = await axios({
            method: 'get',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                scope: 'read_all',
                'cache-control': 'no-cache',
            },
        });
        return response.data;
    } catch (error) {
        const message = error.response.data.message;
        throw new Error(message);
    }
}

async function insertManyActivities(activities) {
    try {
        const response = await Activity.insertMany(activities, {
            ordered: false,
            lean: true,
        });
        const insertedCount = response.length;
        return { insertedCount };
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
