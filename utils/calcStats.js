const dayjs = require('dayjs');

const daysOfWeek = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
const periodOfDay = {
    earlyMorning: 0,
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
};

const statObj = {
    total_distance: 0,
    average_distance: 0,
    total_elev_gain: 0,
    average_elev_gain: 0,
    total_moving_time: 0,
    average_moving_time: 0,
    count: 0,
    average_speed: 0,
};

function calcStats(activities) {
    const stats = {
        all: {
            type: 'all',
            year: null,
            month: null,
            daysOfWeek: Object.assign({}, daysOfWeek),
            periodOfDay: Object.assign({}, periodOfDay),
            topActivities: Object.assign({}),
            ...statObj,
        },
    };
    activities.forEach((activity) => {
        const date = dayjs(activity.start_date);
        const year = date.year();
        const month = date.month() + 1;
        if (!stats[year])
            stats[year] = {
                type: 'year',
                month: null,
                year,
                daysOfWeek: Object.assign({}, daysOfWeek),
                periodOfDay: Object.assign({}, periodOfDay),
                topActivities: Object.assign({}),
                ...statObj,
            };
        if (!stats[`${month}${year}`])
            stats[`${month}${year}`] = {
                type: 'month',
                year,
                month,
                daysOfWeek: Object.assign({}, daysOfWeek),
                periodOfDay: Object.assign({}, periodOfDay),
                topActivities: Object.assign({}),
                ...statObj,
            };

        addActivityToStat(stats.all, activity);
        addActivityToStat(stats[year], activity);
        addActivityToStat(stats[`${month}${year}`], activity);
    });

    const formattedStats = formatStats(stats);
    return formattedStats;
}

function addActivityToStat(stat, activity) {
    stat.count++;
    stat.total_distance += activity.distance;
    stat.average_distance = stat.total_distance / stat.count;
    stat.total_elev_gain += activity.total_elevation_gain;
    stat.average_elev_gain = stat.total_elev_gain / stat.count;
    stat.total_moving_time += activity.moving_time;
    stat.average_moving_time = stat.total_moving_time / stat.count;
    stat.average_speed = stat.total_distance / stat.total_moving_time;

    const date = dayjs(activity.start_date);
    const hour = date.hour();
    if (hour < 3) stat.periodOfDay.night++;
    else if (hour < 7) stat.periodOfDay.earlyMorning++;
    else if (hour < 12) stat.periodOfDay.morning++;
    else if (hour < 17) stat.periodOfDay.afternoon++;
    else if (hour < 21) stat.periodOfDay.evening++;
    else if (hour >= 21) stat.periodOfDay.night++;

    const dayOfWeek = date.day();
    stat.daysOfWeek[dayOfWeek]++;

    const topActivityMetrics = [
        { key: 'distance', measure: 'highest' },
        { key: 'moving_time', measure: 'highest' },
        { key: 'total_elevation_gain', measure: 'highest' },
        { key: 'average_speed', measure: 'highest' },
        { key: 'elev_high', measure: 'highest' },
        { key: 'elev_low', measure: 'lowest' },
    ];
    topActivityMetrics.forEach((metric) => {
        if (metric.key in activity) {
            calcTopActivities(stat, activity, metric);
        }
    });
}

function calcTopActivities(stat, activity, metric) {
    const { key, measure } = metric;
    const metricValue = activity[key];
    if (!metricValue || metricValue === null) return;

    if (stat.topActivities[key]) {
        stat.topActivities[key].push({
            _id: activity._id,
            [key]: metricValue,
        });
        if (measure === 'highest') {
            stat.topActivities[key].sort((a, b) => {
                return b[key] - a[key];
            });
        } else if (measure === 'lowest') {
            stat.topActivities[key].sort((a, b) => {
                return a[key] - b[key];
            });
        }

        if (stat.topActivities[key].length > 5) {
            stat.topActivities[key].pop();
        }
    } else {
        stat.topActivities[key] = [
            {
                _id: activity._id,
                [key]: metricValue,
            },
        ];
    }
}

function formatStats(stats) {
    const statsArray = [];
    for (const key in stats) {
        const stat = stats[key];
        for (const key in stat.topActivities) {
            stat.topActivities[key] = stat.topActivities[key].map(
                (activity) => activity._id
            );
        }
        statsArray.push(stat);
    }
    return statsArray;
}

module.exports = { calcStats };
