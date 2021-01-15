const { Schema, model } = require('mongoose');

const statSchema = new Schema({
    type: String,
    stat_id: { type: Number, unique: true },
    year: Number,
    month: Number,
    daysOfWeek: {
        mo: Number,
        tu: Number,
        we: Number,
        th: Number,
        fr: Number,
        sa: Number,
        su: Number,
    },
    periodOfDay: {
        earlyMorning: Number,
        morning: Number,
        afternoon: Number,
        evening: Number,
        night: Number,
    },
    topActivities: {
        type: Map,
        of: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
    },
    total_distance: Number,
    average_distance: Number,
    total_elev_gain: Number,
    average_elev_gain: Number,
    total_moving_time: Number,
    average_moving_time: Number,
    count: Number,
    average_speed: Number,
});

statSchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = model('Stat', statSchema);
