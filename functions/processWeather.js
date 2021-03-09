const fs = require('fs');
require('../');

(async () => {
    try {
        const activities = readActivities();
        const data = processWeather(activities);
        saveActivities({ data }, `weatherDataProcessed`);
        console.log(data.length);
        console.log('Finished');
    } catch (error) {
        console.error(error);
    }
})();

function processWeather(weatherData) {
    return weatherData.map((a) => {
        const { id, values } = a;
        const conditions = new Set();
        const data = values.reduce((a, c, i) => {
            a.windDirection += c.wdir;
            a.sunrise = c.sunrise;
            a.sunset = c.sunset;
            a.cloudCover += c.cloudcover;
            a.minTemp = min(a.minTemp, c.mint);
            a.maxTemp = max(a.maxTemp, c.maxt);
            a.precip = max(a.precip, c.precip);
            a.dewPoint += c.dew;
            a.humidity = max(a.humidity, c.humidity);
            a.visibility = max(a.visibility, c.visibility);
            a.windSpeed = max(a.windSpeed, c.wspd);
            a.heatIndex = max(a.heatIndex, c.heatindex);
            a.moonPhase = c.moonphase;
            a.snowDepth = max(a.snowDepth, c.snowdepth);
            a.maxPressure = max(a.maxPressure, c.sealevelpressure);
            a.minPressure = min(a.minPressure, c.sealevelpressure);
            a.snow = max(a.snow, c.snow);
            a.solarRadiation = max(a.solarRadiation, c.solarradiation);
            a.windGust = max(a.windGust, c.wgust);
            a.windChill = min(a.windChill, c.windchill);
            c.conditions.split(', ').forEach((e) => {
                conditions.add(e);
            });

            if (values.length > 1 && i + 1 === values.length) {
                a.windDirection = Number.parseInt(a.windDirection / values.length);
                a.cloudCover = Number.parseInt(a.cloudCover / values.length);
                a.dewPoint = Number.parseInt(a.dewPoint / values.length);
            }

            if (values.length === i + 1) {
                a.conditions = Array.from(conditions);
            }

            return { activityId: id, ...a };
        }, weatherObject());

        return data;
    });
}

function max(a, b) {
    if (a === null) return b;
    return a < b ? b : a;
}

function min(a, b) {
    if (a === null) return b;
    return a > b ? b : a;
}

function weatherObject() {
    return {
        windDirection: 0,
        cloudCover: 0,
        minTemp: null,
        maxTemp: null,
        precip: null,
        solarRadiation: null,
        dewPoint: 0,
        humidity: null,
        visibility: null,
        windSpeed: null,
        heatIndex: null,
        snowDepth: null,
        maxPressure: null,
        minPressure: null,
        snow: null,
        windGust: null,
        conditions: [],
        windChill: null,
    };
}

function saveActivities(data, fileName) {
    try {
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data));
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}

function readActivities() {
    const data = [];
    try {
        for (let i = 1; i < 16; i++) {
            const rawData = fs.readFileSync(`./weatherData-${i}.json`, 'utf8');
            data.push(...JSON.parse(rawData).weatherData);
        }
        return data;
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
