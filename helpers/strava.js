const axios = require('axios');
const firebase = require('./firebase');
const stravaKeys = require('../config/strava.key.json');

const getAccessToken = async () => {
    const {
        accessToken,
        expiresAt,
        refreshToken,
    } = await firebase.getStravaAccessToken();
    const currentDateUnix = new Date().valueOf();
    const expiredDateUnix = expiresAt * 1000;
    if (expiredDateUnix < currentDateUnix + 3000000) {
        const newAccessToken = await getNewToken(refreshToken);
        return newAccessToken;
    } else {
        return accessToken;
    }
};

const getNewToken = async (refreshToken) => {
    try {
        const { client_secret, client_id } = stravaKeys;
        const url = `https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token&refresh_token=${refreshToken}`;
        const response = await axios({
            method: 'post',
            url,
            headers: {
                Accept: '*/*',
            },
        });
        const data = response.data;
        const newTokenData = {
            accessToken: data.access_token,
            expiresAt: data.expires_at,
            refreshToken: data.refresh_token,
        };
        await firebase.saveNewToken(newTokenData);
        return data.access_token;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { getAccessToken };
