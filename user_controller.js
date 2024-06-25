process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const axios = require('axios');
const qs = require('qs');
const Log = require('./logModel');
const Client = require('./clientModel');
const clientId = 'F71GS9fzJUpwfgAyVcb8iBndQWEa';
const clientSecret = 'cEfVp17FnyLBEIfv5JLs75n2EZA1yAK2KNCU8ffJwaIa';
const host = `https://identity.lifetek.vn`;
const tokenEndpoint = `${host}:9443/oauth2/token`;

const ROLE_VIEW_SCOPE = 'internal_role_mgt_view';
const USER_CREATE_SCOPE = 'internal_user_mgt_create';
const USER_VIEW_SCOPE = 'internal_user_mgt_view';
const USED_SCOPE = USER_CREATE_SCOPE;

const getToken = async (scope) => {
    const data = qs.stringify({
        'grant_type': 'client_credentials',
        'scope': scope
    });
    const iam = await Client.findOne({ clientId, clientSecret });
    if (iam) {
        const config = {
            method: 'post',
            url: tokenEndpoint,
            headers: {
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        try {
            const response = await axios(config);
            return response.data.access_token;
        } catch (error) {
            return console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        };
    }
    else {
        return console.log("Missing IAM config for clientId, clientSecret")
    }

};

const getUserAttributes = async (username, accessToken) => {
    const userEndpoint = `${host}:9443/scim2/Users?filter=userName eq "${username}"`;

    const config = {
        method: 'get',
        url: userEndpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 403) {
            return console.error('Không có quyền thực hiện yêu cầu:', error.response.data);
        } else {
            return console.error('Error fetching user attributes:', error.response ? error.response.data : error.message);
        }
    };
};

const getRoleAttributes = async (userId, accessToken) => {
    const userEndpoint = `https://identity.lifetek.vn:9443/scim2/v2/Roles/${userId}`;

    const config = {
        method: 'get',
        url: userEndpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        return console.log('response.data', response.data);
    } catch (error) {
        return console.error('Error fetching user attributes:', error.response ? error.response.data : error.message);
    };
};

const createUser = async (req, res) => {
    const accessToken = await getToken(USED_SCOPE);
    const userEndpoint = `${host}:9443/scim2/Users`;
    const { body } = req;
    const iam = await Client.findOne({ clientId, clientSecret }).countDocuments()
    if (process.env.IAM_ENABLE !== "TRUE") {
        return res.json("IAM is disabled, user creation is not allowed.")
    }
    if (iam <= 0) {
        return res.json('Missing IAM config for clientId, clientSecret ')
    }
    const user = {
        "schemas": [],
        "name": {
            "familyName": body.familyName,
            "givenName": body.givenName
        },
        "userName": body.userName,
        "password": body.password,
        "emails": [
            {
                "primary": true,
                "value": body.value,
                "type": body.type
            }
        ]
    };
    const config = {
        method: 'post',
        url: userEndpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        data: user
    };

    try {
        const response = await axios(config);
        res.status(200).json({
            status: "success",
            data: response.data,
            message: "User created successfully"
        })
        // Log success
        const log = new Log({
            action: 'createUser',
            status: 'success',
            response: response.data
        });
        await log.save();
        return
    } catch (error) {
        if (error.response && error.response.status === 409) { // HTTP 409 Conflict
            return res.json('User already exists.');
        } else if (error.response && error.response.status === 403) {
            return res.json('There is no authority to make the request:', error.response.data);
        } else {
            return res.json('Error creating user:', error.response ? error.response.data : error.message);
        }
    };
};

module.exports = {
    getToken,
    createUser
};