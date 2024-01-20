const axios = require('axios');

async function getCourses(url) {
    const headers = {"Content-Type": "application/json"};
    const data = {
        "__args": [null, "4"],
        "__gsh": "00000000"
    };

    const response = await axios.post(url, data, {headers});
    return response.data;
}

module.exports = getCourses;