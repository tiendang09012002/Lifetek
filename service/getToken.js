const https = require('https');
const axios = require('axios')
const qs = require('qs');
const host = `https://identity.lifetek.vn`;
const tokenEndpoint = `${host}:9443/oauth2/token`;
const ROLE_VIEW_SCOPE = 'internal_role_mgt_view';

const agent = new https.Agent({
    rejectUnauthorized: false,
});


const getToken = async (scope, iamClientId, iamClientSecret) => {
    const data = qs.stringify({
        'grant_type': 'client_credentials',
        'scope': scope,
    });

    const config = {
        method: 'post',
        url: tokenEndpoint,
        headers: {
            'Authorization': 'Basic ' + Buffer.from(iamClientId + ':' + iamClientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
        httpsAgent: agent
    };

    try {
        const response = await axios(config);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = getToken