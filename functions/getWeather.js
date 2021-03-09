const fs = require('fs');
const dayJS = require('dayjs');
const axios = require('axios');
require('../');
const Activity = require('../mongoDB/models/activity');
const { connectMongoose, closeMongoose } = require('../mongoDB');
const darkskyKey = require('../config/darksky.key.json').key;
const vcKey = require('../config/visualCrossing.key.json').key;

(async () => {
    try {
        // await connectMongoose('production');
        // const activities = await Activity.find(
        //     {},
        //     '_id start_latlng start_date_local elapsed_time'
        // );
        const activities = await readActivities();
        // await processWeather(activities);
        await getWeather(activities);
        console.log('Finished');
        // const weather = await fetchWeather(dates[0]);
        // console.log(weather);
        // await saveActivities({ weather }, 'weather');
        // await closeMongoose();
    } catch (error) {
        // await closeMongoose();
        console.error(error);
    }
})();

async function getWeather({ activities }) {
    for (const a of activities) {
        // console.log(a);
        if (a.id !== '5fd818d29171ea57e0d38bce') continue;
        const weather = await fetchWeather(a);
        saveActivities(weather, 'weatherTest');
    }
}

async function processWeather({ activities }) {
    const activitiesSet = new Set();
    let i = 0;
    let cost = 177;
    for (const activity of activities) {
        i++;
        if (cost > 700) break;
        if (i < 501) continue;
        if (activity.start_latlng === null) continue;

        const weatherRaw = await fetchWeather(activity);
        const { values, cost: queryCost } = parseWeather(weatherRaw);
        activitiesSet.add({ id: activity.id, values });
        if (i % 50 === 0) {
            const activitiesArray = Array.from(activitiesSet);
            await saveActivities(
                { weatherData: activitiesArray },
                `weatherData-${Number.parseInt(i / 50)}`
            );
            activitiesSet.clear();
        }
        cost += queryCost;
        console.log(`${i}: ${activity.id} - Current Cost: ${cost}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    const activitiesArray = Array.from(activitiesSet);
    await saveActivities(
        { weatherData: activitiesArray },
        `weatherData-${Number.parseInt((i + 50) / 50)}`
    );
}

function parseWeather(weather) {
    const weatherValues = weather.location.values;
    const cost = weather.queryCost;
    return { values: weatherValues, cost };
}

async function fetchWeather(activity) {
    const lat = activity.start_latlng.lat;
    const lng = activity.start_latlng.lng;
    const startDate = activity.start_date;
    const endDate = activity.end_date;
    const startTime = activity.start_time;
    const endTime = activity.end_time;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/history?&aggregateHours=1&dayStartTime=${startTime}&dayEndTime=${endTime}&startDateTime=${startDate}&endDateTime=${endDate}&unitGroup=metric&contentType=json&locations=${lat},${lng}&&locationMode=single&includeAstronomy=true&key=${vcKey}`;
    try {
        const response = await axios({
            method: 'get',
            url,
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

function parseActivities(activities) {
    const parsedActivities = activities.map((activity) => {
        const start_date = dayJS(activity.start_date_local).utc().format('YYYY-MM-DDT00:00:00');
        const end_date = dayJS(activity.start_date_local)
            .utc()
            .add(activity.elapsed_time, 'second')
            .format('YYYY-MM-DDT00:00:00');
        const start_time = dayJS(activity.start_date_local).utc().format('HH:mm:ss');
        const end_time = dayJS(activity.start_date_local)
            .utc()
            .add(activity.elapsed_time, 'second')
            .format('HH:mm:ss');

        return {
            id: activity._id,
            start_latlng: activity.start_latlng,
            start_date,
            end_date,
            start_time,
            end_time,
        };
    });
    saveActivities({ activities: parsedActivities }, 'activities');
}

// async function fetchWeather(activity) {
// 	const lat = activity.start_latlng.lat;
// 	const lng = activity.start_latlng.lng;
// 	const time = activity.start_date
//     const url = `https://api.darksky.net/forecast/${darkskyKey}/${lat},${lng},${time}?units=si`;
//     try {
//         const response = await axios({
//             method: 'get',
//             url,
//             headers: {
//                 Accept: 'application/json',
//                 scope: 'read_all',
//                 'cache-control': 'no-cache',
//             },
//         });
//         return response.data;
//     } catch (error) {
//         console.error(error);
//     }
// }

async function saveActivities(data, fileName) {
    try {
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data));
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}

function readActivities() {
    try {
        const rawData = fs.readFileSync('./activities.json', 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
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
