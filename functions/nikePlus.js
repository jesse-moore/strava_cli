const fs = require('fs');
const axios = require('axios');
const token = require('../config/nikePlus.key.json').token;

const accessToken = token;

(async function main() {
    // await fetchActivities();
	await fetchDetailedActivities();
})();

async function fetchDetailedActivities(){
	const detailedActivities = new Set();
	const activities = await readActivities();
	const ids = JSON.parse(activities).activities.map(a=>a.id);
	const idsSet = new Set(ids);
	let i = 0;
	for (const id of idsSet) {
		i++;
		const activity = await fetchDetailedActivity(id);
		detailedActivities.add(activity);
		console.log(`${i}: ${id}`);
		if(i%50 === 0) {
			const activitiesArray = Array.from(detailedActivities);
			await saveActivities({detailedActivities:activitiesArray}, `detailedActivities-${Number.parseInt(i/50)}`);
			detailedActivities.clear();
		}
		await new Promise((resolve) => setTimeout(resolve, 2000));		
	}
	await saveActivities({detailedActivities:Array.from(detailedActivities)}, `detailedActivities-${Number.parseInt((i+50)/50)}`);
	console.log("Finished");
}

async function fetchActivities() {
	const activities = [];
	let afterID = null;
	let i = 0;
	do {
		const response = await fetchActivity(afterID)
		if(response.activities) activities.push(...response.activities);
		response.paging.after_id ? afterID = response.paging.after_id : null;
		console.log(`${i}: ${afterID}`)
		i++
		await new Promise((resolve) => setTimeout(resolve, 2000));
	} while (afterID != null && i < 10);
	await saveActivities({activities})
}

async function fetchActivity(afterID) {
	let url = "";
    try {
		if(afterID) {
			url = `https://api.nike.com/sport/v3/me/activities/after_id/${afterID}`;
		} else {
			url = 'https://api.nike.com/sport/v3/me/activities/after_time/0';
		}
        
        const response = await axios({
            method: 'get',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const message = error.response.data.message;
        console.log(message)
    }
}

async function fetchDetailedActivity(id) {
	const url = `https://api.nike.com/sport/v3/me/activity/${id}?metrics=ALL`
    try {
        const response = await axios({
            method: 'get',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const message = error.response.data;
		console.log(message)
    }
}

async function saveActivities(data, fileName) {
    try {
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data));
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}

async function readActivities() {
    try {
        return fs.readFileSync('./activities.json' ,'utf8');
    } catch (error) {
        console.error(error.name);
        console.error(error.message);
    }
}
