const axios = require('axios');
require('../');
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const { getAccessToken } = require('../helpers');
const { parseActivities } = require('../utils');

(async () => {
    try {
        await connectMongoose();
        const accessToken = await getAccessToken();
        let invalidEntriesCount = 0;
        let insertedCount = 0;
        let writeErrorsCount = 0;
        let duplicatesCount = 0;
        let page = 1;
        do {
            const activities = await fetchActivities(accessToken, page);
            const { validEntries, invalidEntries } = parseActivities(
                activities
            );
            invalidEntriesCount += invalidEntries.length;

            const response = await insertManyActivities(validEntries);
            insertedCount += response.insertedCount;
            writeErrorsCount += response.writeErrors.length;
            duplicatesCount += response.duplicates.length;
            page++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
        } while (page < 10 && duplicatesCount === 0);
        await closeMongoose();
        console.log(`Inserted ${insertedCount} new activities`);
        if (writeErrorsCount || invalidEntriesCount) {
            console.log(`Error inserting ${writeErrorsCount} activities`);
            console.log(`Error parsing ${invalidEntriesCount} activities`);
        }
    } catch (error) {
        console.error(error);
    }
})();

const baseURL = 'https://www.strava.com/api/v3/';

async function fetchActivities(accessToken, page) {
    const perPage = 30;
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
            rawResult: true,
        });
        const { insertedCount } = response;
        return { insertedCount, writeErrors: [], duplicates: [] };
    } catch (error) {
        const result = handleMongoError(error);
        return result;
    }
}

function handleMongoError(error) {
    switch (error.name) {
        case 'BulkWriteError':
            const writeErrors = error.result.result.writeErrors.filter(
                filterDuplicateIDErrors
            );
            const duplicates = error.result.result.writeErrors.filter(
                (e) => !filterDuplicateIDErrors(e)
            );
            return {
                duplicates,
                writeErrors,
                insertedCount: error.result.result.nInserted,
            };
        default:
            throw new Error(`Error inserting documents ${error.message}`);
    }
}

function filterDuplicateIDErrors(e) {
    if (e.code === 11000) return false;
    return true;
}
