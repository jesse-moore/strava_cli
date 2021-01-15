const dayjs = require('dayjs');

const daysOfWeek = { mo: 0, tu: 0, we: 0, th: 0, fr: 0, sa: 0, su: 0 };
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

const statsObj = {
    0: {
        type: 'all',
        stat_id: 0,
        year: null,
        month: null,
        daysOfWeek: Object.assign({}, daysOfWeek),
        periodOfDay: Object.assign({}, periodOfDay),
        topActivities: new Map(),
        ...statObj,
    },
};

function calcStats(activities, stats = statsObj) {
    activities.forEach((activity) => {
        if (activity.type !== 'Run' && activity.type !== 'VirtualRun') return;
        const date = new Date(activity.start_date_local);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        if (!stats[makeStatID(year)])
            stats[makeStatID(year)] = {
                type: 'year',
                stat_id: makeStatID(year),
                month: null,
                year,
                daysOfWeek: Object.assign({}, daysOfWeek),
                periodOfDay: Object.assign({}, periodOfDay),
                topActivities: new Map(),
                ...statObj,
            };
        if (!stats[makeStatID(year, month)])
            stats[makeStatID(year, month)] = {
                type: 'month',
                stat_id: makeStatID(year, month),
                year,
                month,
                daysOfWeek: Object.assign({}, daysOfWeek),
                periodOfDay: Object.assign({}, periodOfDay),
                topActivities: new Map(),
                ...statObj,
            };

        addActivityToStat(stats[0], activity);
        addActivityToStat(stats[makeStatID(year)], activity);
        addActivityToStat(stats[makeStatID(year, month)], activity);
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

    const date = new Date(activity.start_date_local);
    const hour = date.getUTCHours();
    if (hour < 3) stat.periodOfDay.night++;
    else if (hour < 7) stat.periodOfDay.earlyMorning++;
    else if (hour < 12) stat.periodOfDay.morning++;
    else if (hour < 17) stat.periodOfDay.afternoon++;
    else if (hour < 21) stat.periodOfDay.evening++;
    else if (hour >= 21) stat.periodOfDay.night++;

    const dayOfWeek = dayjs(date).format('dd').toLowerCase();
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

    if (stat.topActivities.has(key)) {
        const newArr = [
            ...stat.topActivities.get(key),
            {
                _id: activity._id,
                [key]: metricValue,
            },
        ];
        if (measure === 'highest') {
            newArr.sort((a, b) => {
                return b[key] - a[key];
            });
        } else if (measure === 'lowest') {
            newArr.sort((a, b) => {
                return a[key] - b[key];
            });
        }

        if (newArr.length > 5) {
            newArr.pop();
        }
        stat.topActivities.set(key, newArr);
    } else {
        stat.topActivities.set(key, [
            {
                _id: activity._id,
                [key]: metricValue,
            },
        ]);
    }
}

function formatStats(stats) {
    const statsArray = [];
    for (const key in stats) {
        const stat = stats[key];
        for (const key of stat.topActivities.keys()) {
            stat.topActivities.set(
                key,
                stat.topActivities.get(key).map((activity) => activity._id)
            );
        }
        statsArray.push(stat);
    }
    return statsArray;
}

function makeStatID(year, month) {
    if (year && month) {
        if (month < 10) {
            return Number(`${year}0${month}`);
        } else {
            return Number(`${year}${month}`);
        }
    } else {
        return Number(year) * 100;
    }
}

module.exports = { calcStats, makeStatID };
