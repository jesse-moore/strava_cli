const fetchDetailedEntry = async (activityID) => {
    const url = `${baseURL}activities/${activityID}`;
    try {
        const accessToken = await getAccessToken();
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
        throw new Error(error);
    }
};
