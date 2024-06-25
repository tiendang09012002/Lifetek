const mongoose = require('mongoose');
const conn = require('./appConn');

const roleTaskSchema = new mongoose.Schema(
  {
    userId: String,
    organizationUnit: {
      name: String,
      organizationUnitId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name_en: String,
    },
    allowedDepartment: {},
    roleGroupSource: String,
    firstLogin: { type: Boolean, default: true },
    hasChangedPwd: Boolean,
    username: String,
  },
  {
    timestamps: true,
  },
);

module.exports = conn.model('Employee', roleTaskSchema);
