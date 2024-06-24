const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const APIError = require('../../helpers/errors/APIError');
const conn = require('../config/appConn');

const roleGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: String,
    clientId: String,
    description: String,
    applyEmployeeOrgToModuleOrg: {
      type: Boolean,
      default: false,
    },
    departments: {},
    order: Number,
    other: {},
    roles: [
      {
        titleFunction: {
          type: String,
          required: true,
        },
        codeModleFunction: {
          type: String,
          required: String,
        },
        clientId: {
          require: true,
          type: String,
        },
        mainRoute: String,
        methods: [
          {
            name: {
              type: String,
              enum: ['GET', 'PATCH', 'DELETE', 'PUT', 'POST', 'IMPORT', 'EXPORT', 'VIEWCONFIG'],
            },
            allow: Boolean,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

/**
 * Statics
 */
roleGroupSchema.statics = {
  /**
   * Get roleGroup
   *
   * @param {ObjectId} id - The objectId of roleGroup.
   * @returns {Promise<roleGroup, APIError>}
   */
  get(id) {
    return this.findOne({
      _id: id,
    })
      .exec()
      .then(roleGroup => {
        if (roleGroup) {
          return roleGroup;
        }
        const err = 'No such roleGroup exists!';
        // const err = new APIError('No such roleGroup exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  async findOrCreate(code) {
    const findGroup = await this.findOne({ code });
    if (!findGroup) {
      return this.create({ name: code, code, departments: {}, roles: [] });
    }
    return findGroup;
  },
  /**
   * List roleGroups in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of roleGroups to be skipped.
   * @param {number} limit - Limit number of roleGroups to be returned.
   * @returns {Promise<roleGroup[]>}
   */
  async list({
    skip = 0,
    limit = 500,
    sort = {
      order: -1,
    },
    filter = {},
    selector,
  }) {
    /* eslint-disable no-param-reassign */
    const [data, count] = await Promise.all([
      this.find(filter, selector || '')
        .sort(sort)
        .skip(+skip)
        .limit(+limit)
        .exec(),
      this.find(filter).count(filter),
    ]);
    return {
      data,
      count,
      limit,
      skip,
    };
  },
};

module.exports = conn.model('RoleGroup', roleGroupSchema);
