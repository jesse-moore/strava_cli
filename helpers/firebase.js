const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase.key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://strava-stats-aac46.firebaseio.com',
});

const db = admin.firestore();

const getStravaAccessToken = async () => {
    const adminRef = db.collection('admin').doc('strava');
    const doc = await adminRef.get();
    if (!doc.exists) {
        throw new Error('No strava access key found');
    } else {
        const data = doc.data();
        if (data === undefined) throw new Error('No strava access key found');
        return {
            accessToken: data.accessToken,
            expiresAt: data.expiresAt,
            refreshToken: data.refreshToken,
        };
    }
};

const saveNewToken = async (newTokenData) => {
    const adminRef = db.collection('admin').doc('strava');
    await adminRef.set(newTokenData);
};

module.exports = { db, getStravaAccessToken, saveNewToken };
