const mongoose = require('mongoose');
const conn = require('./appConn');


const roleTaskSchema = new mongoose.Schema(
  {
    moduleCode: String,
    userId: { type: mongoose.Schema.Types.ObjectId },
    roles: [
      {
        code: { type: String, required: true },
        name: { required: true, type: String },
        type: { type: Number },
        column: [{ name: { type: String, required: true }, title: String }],
        row: [{ name: { type: String, required: true }, title: String }],
        data: [{
          name: { type: String, required: true },
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrganizationUnit'
          },
          data: {}
        }]
      }
    ],

    status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = conn.model('RoleApp', roleTaskSchema);
