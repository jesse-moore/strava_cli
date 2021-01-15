const axios = require('axios');
const fs = require('fs');
require('../');
const { getAccessToken } = require('../helpers');

(async () => {
    try {
        const ids = [];
        const activities = await fetchActivities(ids);
        await saveActivities(activities);
        console.log(`Saved activities`);
    } catch (error) {
        console.error(error);
    }
})();

async function fetchActivities(ids) {
    const accessToken = await getAccessToken();
	
	const activitiesArray = Promise.all(ids.map(async id=>{
		const activity = await fetchActivity(accessToken, id);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return activity
	}));
    return activitiesArray;
}

async function fetchActivity(accessToken, id) {
    const baseURL = 'https://www.strava.com/api/v3/';
    const url = `${baseURL}activities/${id}`;
    try {
        const response = await axios({
            method: 'get',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                scope: 'read_all',
                'cache-control': 'no-cache',
            },
        });
        return response.data;
    } catch (error) {
        const message = error.response.data.message;
        throw new Error(message);
    }
}

async function saveActivities(data) {
    try {
        fs.writeFileSync('./activities.json', JSON.stringify(data));
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
