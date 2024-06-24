const mongoose = require('mongoose');

module.exports = mongoose.createConnection(process.env.DATABASE_ROLE_DEPARTMENT);
