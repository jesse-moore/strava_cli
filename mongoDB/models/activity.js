const { Schema, model } = require('mongoose')

const activitySchema = new Schema({
    name: String,
    distance: Number,
    moving_time: Number,
    elapsed_time: Number,
    total_elevation_gain: Number,
    type: String,
    workout_type: Number,
    strava_id: { type: Number, unique: true },
    start_date: Date,
    start_date_local: Date,
    timezone: String,
    utc_offset: Number,
    start_latlng: { type: [Number], default: null },
    end_latlng: { type: [Number], default: null },
    location_city: String,
    location_state: String,
    location_country: String,
    start_latitude: Number,
    start_longitude: Number,
    map: {
        id: String,
        summary_polyline: String,
        resource_state: Number,
    },
    average_speed: Number,
    max_speed: Number,
    elev_high: Number,
    elev_low: Number,
    month: Number,
    year: Number,
})

activitySchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = model('Activity', activitySchema)
