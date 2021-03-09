const axios = require('axios');
require('../');
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { getAccessToken } = require('../helpers');
const { addIDToQueue } = require('../helpers/firebase');

(async () => {
    try {
        await connectMongoose('production');
        const indexSet = await getIndexSet();
        await closeMongoose();
        const accessToken = await getAccessToken();
        const newIds = [];
        let page = 1;
        do {
            const activities = await fetchActivities(accessToken, page);
            const newIdsTemp = [];
            activities.forEach((activity) => {
                if (typeof activity.id !== 'number' || indexSet.has(activity.id)) {
                    return;
                }
                newIdsTemp.push(activity.id);
            });
            newIds.push(...newIdsTemp);
            if (newIds.length < activities.length) break;
            page++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } while (page < 5);
        addIDToQueue(newIds);
    } catch (error) {
        await closeMongoose();
        console.error(error);
    }
})();

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

const getIndexSet = async () => {
    try {
        const indexArray = await Activity.distinct('strava_id');
        if (!Array.isArray(indexArray)) {
            throw new Error('Failed to get index');
        }
        return new Set(indexArray);
    } catch (error) {
        throw new Error(error.message);
    }
};
