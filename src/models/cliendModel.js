const mongoose = require('mongoose');
const conn = require('../config/appConn');

const clientIamSchema = new mongoose.Schema(
    {
        clientId: String,
        IamclientSecret: String,
        IamclientId: String,
    },
    {
        timestamps: true,
    },
);

module.exports = conn.model('clientiam', clientIamSchema);
