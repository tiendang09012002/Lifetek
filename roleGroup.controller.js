/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const RoleGroup = require('./roleGroup.model');
const Employee = require('./employee.model');
const RoleDeparment = require('./roleDepartment.model');
const OrganizationUnit = require('./organizationUnit.model');
const APIError = require('../../helpers/errors/APIError');
const httpStatus = require('http-status');
const STATUS = require('../../variables/CONST_STATUS').STATUS;
const User = require('../users/user.model');
const Role = require('../role/role.model');
const lodash = require('lodash');
const axios = require('axios');
const Client = require('../oauth/client.model');

/**
 * Load roleGroup and append to req
 */
async function load(req, res, next, id) {
  // eslint-disable-next-line no-param-reassign
  req.roleGroup = await RoleGroup.findById(id);
  if (!req.roleGroup) {
    next(new APIError('Item not found', httpStatus.NOT_FOUND, true));
  }
  next();
}
/**
 * list roleGroup
 */
async function list(req, res, next) {
  try {
    const { limit = 500, skip = 0, clientId, sort, filter = {}, selector } = req.query;
    if (!clientId) {
      //do code dự án carbon k có clientId
      const listRoleGroups = await RoleGroup.list({ limit, skip, sort, filter: { clientId: '70_CRM' }, selector });
      console.log('Không có clientId');
      return res.json(listRoleGroups);
    }
    const newFilter = {
      ...filter,
      clientId,
    };
    const roleGroups = await RoleGroup.list({ limit, skip, sort, filter: newFilter, selector });
    return res.json(roleGroups);
  } catch (e) {
    next(e);
  }
}
/**
 * create roleGroup
 */
async function create(req, res, next) {
  try {
    const {
      clientId,
      name,
      code,
      description,
      roles,
      applyEmployeeOrgToModuleOrg = false,
      departments,
      order,
      other,
    } = req.body;
    const existCode = await RoleGroup.findOne({ clientId, code });
    if (existCode) {
      const err = new APIError('Exist roleGroup with code');
      return next(err);
    }
    const roleGroup = new RoleGroup({
      clientId,
      name,
      code,
      description,
      roles,
      applyEmployeeOrgToModuleOrg,
      departments,
      order,
      other,
    });

    return roleGroup.save().then(savedroleGroup => {
      if (savedroleGroup) res.json(savedroleGroup);
      else res.transforemer.errorBadRequest('Can not create item');
    });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
}

function appHost(url) {
  if (url) {
    const host = url.split('/');
    return host[2];
  }
}
/**
 * update roleGroup
 */
// eslint-disable-next-line consistent-return
async function update(req, res, next) {
  try {
    const author = req.headers.authorization;
    let host;
    if (author) {
      axios.defaults.headers.common['Authorization'] = author;
    }

    const {
      clientId,
      name,
      code,
      description,
      roles,
      applyEmployeeOrgToModuleOrg = false,
      departments,
      order,
      other,
    } = req.body;
    const existCode = await RoleGroup.findOne({ code });
    if (existCode && code !== req.roleGroup.code) {
      const err = new APIError('Exist roleGroup with code');
      return next(err);
    }
    const roleGroup = req.roleGroup;
    roleGroup.clientId = clientId;
    roleGroup.name = name;
    roleGroup.code = code;
    roleGroup.description = description;
    roleGroup.roles = roles;
    roleGroup.applyEmployeeOrgToModuleOrg = applyEmployeeOrgToModuleOrg;
    roleGroup.departments = departments;
    roleGroup.order = order;
    if (other) {
      roleGroup.other = other;
    }

    const getRederect = await Client.findOne({ clientId });
    if (getRederect) {
      const uri = getRederect.redirectUris[0];
      host = appHost(uri);
    }
    return roleGroup.save().then(async result => {
      // await Employee.updateMany({ roleGroupSource: code }, { firstLogin: true });
      await axios
        .put(
          `https://${host}/api/employees/first-login`,
          { roleGroupSource: code },
          {
            headers: {
              'Content-type': 'application/json',
            },
          },
        )
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error.response);
        });
      res.json(result);
    });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
}

async function updateRoleGroupUser(req, res, next) {
  try {
    const {
      clientId,
      name,
      code,
      description,
      roles,
      applyEmployeeOrgToModuleOrg = false,
      departments,
      other,
      order,
    } = req.body;
    const existCode = await RoleGroup.findOne({ code });
    if (existCode && code !== req.roleGroup.code) {
      const err = new APIError('Exist roleGroup with code');
      return next(err);
    }
    const dbRoleApplyEmployeeOrgToModuleOrg = req.roleGroup.applyEmployeeOrgToModuleOrg;
    const dbDepartments = req.roleGroup.departments;
    const roleGroup = req.roleGroup;
    roleGroup.clientId = clientId;
    roleGroup.name = name;
    roleGroup.code = code;
    roleGroup.description = description;
    roleGroup.roles = roles;
    roleGroup.applyEmployeeOrgToModuleOrg = applyEmployeeOrgToModuleOrg;
    roleGroup.departments = departments;
    roleGroup.order = order;
    if (other) {
      roleGroup.other = other;
    }

    const [updatedRole, userRoles] = await Promise.all([
      roleGroup.save(),
      Role.updateMany({ groupId: roleGroup._id }, { roles }),
    ]);
    if (applyEmployeeOrgToModuleOrg && !dbRoleApplyEmployeeOrgToModuleOrg) {
      const employeesInGroup = await Employee.find({ roleGroupSource: roleGroup.code }).lean();
      const listOrganizations = await OrganizationUnit.find({ status: STATUS.ACTIVED }).lean();
      await Promise.all(
        employeesInGroup.map(async employee => {
          const employeeOrganizationUnitId =
            employee.organizationUnit && employee.organizationUnit.organizationUnitId
              ? employee.organizationUnit.organizationUnitId.toString()
              : '';
          if (!employeeOrganizationUnitId) return;
          const newDepartRole = {
            code: 'DERPARTMENT',
            column: [
              {
                name: 'view',
                title: 'Xem',
              },
              {
                name: 'edit',
                title: 'Sửa',
              },
              {
                name: 'delete',
                title: 'Xóa',
              },
            ],
            data: listOrganizations.map(item => ({
              data:
                item.path && item.path.includes(employeeOrganizationUnitId)
                  ? { view: true, edit: true, delete: true }
                  : { view: false, edit: false, delete: false },
              expand: false,
              id: item._id,
              name: item._id,
              open: true,
              slug: item.path,
            })),
            type: 0,
            name: 'Phòng ban',
            row: listOrganizations.map(l => ({
              access: false,
              expand: false,
              id: l._id,
              level: l.level,
              name: l._id,
              open: false,
              parent: l.parent,
              slug: l.path,
              title: l.name,
            })),
          };
          return await Promise.all([
            RoleDeparment.updateMany(
              { userId: employee._id, 'roles.name': 'Phòng ban' },
              {
                $set: {
                  'roles.$.data': newDepartRole.data,
                  'roles.$.row': newDepartRole.row,
                },
              },
            ),
            Employee.updateOne(
              { _id: employee._id },
              { $set: { allowedDepartment: { roles: [newDepartRole], moduleCode: true } } },
            ),
          ]);
        }),
      );
    }
    if (!applyEmployeeOrgToModuleOrg && departments) {
      if (
        dbDepartments &&
        (lodash.isEqual(JSON.parse(JSON.stringify(dbDepartments)), departments) || dbRoleApplyEmployeeOrgToModuleOrg)
      ) {
        return res.json(updatedRole);
      }
      const employeesInGroup = await Employee.find({ roleGroupSource: roleGroup.code }).lean();
      await Promise.all(
        employeesInGroup.map(async employee =>
          Promise.all([
            RoleDeparment.updateMany(
              { userId: employee._id, 'roles.name': 'Phòng ban' },
              {
                $set: {
                  'roles.$.data': departments.roles[0].data,
                  'roles.$.row': departments.roles[0].row,
                },
              },
            ),
            Employee.updateOne(
              { _id: employee._id },
              { $set: { allowedDepartment: { ...departments, moduleCode: true } } },
            ),
          ]),
        ),
      );
    }
    return res.json(updatedRole);
  } catch (e) {
    console.log('update role group error', e);
    return next(e);
  }
}

async function updateRoleGroupUserH05(req, res, next) {
  try {
    let host;
    const {
      clientId,
      name,
      code,
      description,
      roles,
      applyEmployeeOrgToModuleOrg = false,
      departments,
      other,
      order,
    } = req.body;
    // console.log('othes', other);
    const existCode = await RoleGroup.findOne({ code });
    if (existCode && code !== req.roleGroup.code) {
      const err = new APIError('Exist roleGroup with code');
      return next(err);
    }
    const roleGroup = req.roleGroup;
    roleGroup.clientId = clientId;
    roleGroup.name = name;
    roleGroup.code = code;
    roleGroup.description = description;
    roleGroup.roles = roles;
    roleGroup.applyEmployeeOrgToModuleOrg = applyEmployeeOrgToModuleOrg;
    roleGroup.departments = departments;
    roleGroup.order = order;
    if (other) {
      roleGroup.other = other;
    }
    const [updatedRole, userRoles] = await Promise.all([
      roleGroup.save(),
      Role.updateMany({ groupId: roleGroup._id }, { roles }),
    ]);
    const getRederect = await Client.findOne({ clientId });
    if (getRederect) {
      const uri = getRederect.redirectUris[0];
      host = appHost(uri);
    }
    await axios.put(
      `https://${host}/api/employeesV2/first-login`,
      { roleGroupSource: code },
      {
        headers: {
          'Content-type': 'application/json',
        },
      },
    );
    return res.json(updatedRole);
  } catch (e) {
    return next(e);
  }
}
/**
 * Delete costEstimate.
 * @returns roleGroup
 */
function del(req, res, next) {
  const roleGroup = req.roleGroup;
  roleGroup.status = STATUS.DELETED;
  roleGroup.code = '';

  roleGroup
    .save()
    .then(result => {
      res.json({
        success: true,
        data: result,
      });
    })
    .catch(e => next(e));
}

async function deletedList(req, res, next) {
  try {
    const { ids } = req.body;
    const arrDataDelete = ids.map(async roleGroupId => RoleGroup.findById(roleGroupId).remove());
    const deletedData = await Promise.all(arrDataDelete);
    res.json({
      success: true,
      data: deletedData,
    });
  } catch (e) {
    //   console.log(e)
    next(e);
  }
}
function get(req, res) {
  res.json(req.roleGroup);
}

module.exports = {
  list,
  load,
  create,
  update,
  del,
  get,
  deletedList,
  updateRoleGroupUser,
  updateRoleGroupUserH05,
};
