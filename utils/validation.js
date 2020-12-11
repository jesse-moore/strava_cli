const schema = require('./validationSchema');

const parseActivities = (activities) => {
    if (!Array.isArray(activities)) {
        throw new Error('Error parsing activities: Activities is not an Array');
    }
    const validEntries = [];
    const invalidEntries = [];
    activities.forEach((activity) => {
        const validatedActivity = parseActivity(activity);
        if ('error' in validatedActivity) {
            invalidEntries.push(validatedActivity);
        } else {
            validEntries.push(validatedActivity);
        }
    });
    return { validEntries, invalidEntries };
};

const parseActivity = (activity) => {
    const { value, error } = schema.validate(activity);
    if (error) {
        return {
            error: {
                message: error.message,
                strava_id: value.strava_id,
            },
        };
    }
    return value;
};

module.exports = { parseActivities };
