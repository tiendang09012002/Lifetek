const mongoose = require('mongoose');

module.exports = function (urlDb) {
  return mongoose.createConnection(urlDb);
};