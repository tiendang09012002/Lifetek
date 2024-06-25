const mongoose = require('mongoose');
const conn = require('./appConn');


const roleTaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    type: {
      type: String,
      enum: ['company', 'department', 'stock', 'factory', 'workshop', 'salePoint', 'corporation', 'location'],
      required: true,
      default: 'company'
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationUnit',
      default: null
    },
    priority: {
      type: Number,
      default: 0
    },
    oUFunction: {
      type: String,
      default: '',
    },
    duty: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: '',
    },
    accountingBranchCode: {
      type: String
    },
    accountingDepartmentCode: {
      type: String,
      default: '',
    },
    path: String,
    status: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 1
    }
  },
  {
    timestamps: true,
  },
);

module.exports = conn.model('OrganizationUnit', roleTaskSchema);
