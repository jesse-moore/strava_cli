const { Schema, model } = require('mongoose');

const indexMapSchema = new Schema({
    of: String,
    index: { type: Map, of: { type: Schema.Types.ObjectId, ref: 'Activity' } },
});

module.exports = model('IndexMap', indexMapSchema);
