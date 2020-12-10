const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const connectMongoose = async () => {
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    try {
        if (typeof MONGODB_URI !== 'string') throw Error('Invaild Mongo URI');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        await closeMongoose();
        console.error('error connection to MongoDB:', error.message);
    }
};

const closeMongoose = async () => {
    await mongoose.connection.close();
};

module.exports = {
    connectMongoose,
    closeMongoose,
};
