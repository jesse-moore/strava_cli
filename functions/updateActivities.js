const axios = require('axios');
require('../');
const Activity = require('../mongoDB/models/activity');
const Stat = require('../mongoDB/models/stat');
const IndexMap = require('../mongoDB/models/indexMap');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { getAccessToken } = require('../helpers');
const { calcStats, makeStatID } = require('../utils');

(async () => {
    try {
        await connectMongoose('production');
        const indexMap = await IndexMap.findOne({ of: 'strava_id' });
        const accessToken = await getAccessToken();
        const newActivities = [];
        let page = 1;
        do {
            const activities = await fetchActivities(accessToken, page);
            const { validActivities } = processActivities(activities, indexMap.index);
            newActivities.push(...validActivities);
            if (validActivities.length < activities.length) break;
            page++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } while (page < 5);

        const insertedCount = await insertManyActivities(newActivities);
        await indexMap.save();
        await updateStats(newActivities);

        await closeMongoose();
        console.log(`Inserted ${insertedCount} new activities`);
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();

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

async function updateStats(activities) {
    const stat_ids = activities
        .map(({ year, month }) => {
            return [makeStatID(year, month), makeStatID(year)];
        })
        .flat();

    const findFilter = [...new Set(stat_ids), 0].map((stat_id) => {
        return { stat_id };
    });
    const stats = await Stat.find({
        $or: findFilter,
    })
        .populate('topActivities.distance', { distance: 1 })
        .populate('topActivities.moving_time', { moving_time: 1 })
        .populate('topActivities.total_elevation_gain', { total_elevation_gain: 1 })
        .populate('topActivities.average_speed', { average_speed: 1 })
        .populate('topActivities.elev_high', { elev_high: 1 })
        .populate('topActivities.elev_low', { elev_low: 1 });

    const statObj = {};
    stats.forEach((stat) => {
        statObj[stat.stat_id] = stat.toObject();
    });
    const newStats = calcStats(activities, statObj);

    await Promise.all(
        newStats.map(async (stat) => {
            return await Stat.replaceOne({ stat_id: stat.stat_id }, stat, { upsert: true });
        })
    );
}

const baseURL = 'https://www.strava.com/api/v3/';

async function fetchActivities(accessToken, page) {
    const perPage = 10;
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
        return response.length;
    } catch (error) {
        console.error(error.message);
    }
}
