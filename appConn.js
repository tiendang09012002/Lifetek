const mongoose = require('mongoose');
const uri = process.env.DATABASE_ROLE_DEPARTMENT || `mongodb+srv://t6ngl4m:uJxJWYn5rRjZrTEK@mxhtm0xx.vw82yvp.mongodb.net/db-iam?retryWrites=true&w=majority&appName=MxHTM0xx`

module.exports = mongoose.createConnection(uri);
