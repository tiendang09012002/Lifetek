const mongoose = require('mongoose');
const uri = process.env.DATABASE_ROLE_DEPARTMENT || `mongodb://127.0.0.1:27017/db`

module.exports = mongoose.createConnection(uri);
