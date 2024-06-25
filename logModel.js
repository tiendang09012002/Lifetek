const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conn = require('./appConn');

const logSchema = new Schema({
    action: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    response: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = conn.model('Log', logSchema);
