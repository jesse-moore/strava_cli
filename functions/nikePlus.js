const axios = require('axios');

const accessToken = '';

(async function main() {
    await fetchActivity();
})();

async function fetchActivity() {
    try {
        const url = 'https://api.nike.com/sport/v3/me/activities/after_time/0';
        const response = await axios({
            method: 'get',
            url,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        const message = error.response.data.message;
        throw new Error(message);
    }
}
