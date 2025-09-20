import Admin from '../models/Admin.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';

// Admin Management
export const getAdmins = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const admins = await Admin.find(filter)
    .populate('roles', 'name')
    .populate('permissions', 'name module action')
    .select('-password -reset_password_token -reset_password_expire')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Admin.countDocuments(filter);

  res.json({
    success: true,
    data: admins,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

export const getAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id)
    .populate('roles', 'name description')
    .populate('permissions', 'name module action description')
    .select('-password -reset_password_token -reset_password_expire');

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  res.json({
    success: true,
    data: admin
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    status,
    isSuperAdmin,
    roleIds,
    permissionIds
  } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Admin with this email already exists'
    });
  }

  const adminData = {
    name,
    email,
    password,
    status,
    isSuperAdmin: isSuperAdmin || false
  };

  if (roleIds && Array.isArray(roleIds)) {
    adminData.roles = roleIds;
  }

  if (permissionIds && Array.isArray(permissionIds)) {
    adminData.permissions = permissionIds;
  }

  const admin = await Admin.create(adminData);

  const populatedAdmin = await Admin.findById(admin._id)
    .populate('roles', 'name')
    .populate('permissions', 'name module action')
    .select('-password');

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: populatedAdmin
  });
});

export const updateAdmin = asyncHandler(async (req, res) => {
  let admin = await Admin.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  const fieldsToUpdate = {
    name: req.body.name,
    status: req.body.status,
    roles: req.body.roleIds,
    permissions: req.body.permissionIds
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  admin = await Admin.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  )
  .populate('roles', 'name')
  .populate('permissions', 'name module action')
  .select('-password');

  res.json({
    success: true,
    message: 'Admin updated successfully',
    data: admin
  });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found'
    });
  }

  // Prevent deletion of super admin
  if (admin.isSuperAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete super admin'
    });
  }

  await Admin.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Admin deleted successfully'
  });
});

// Role Management
export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({ is_active: true })
    .populate('permissions', 'name module action description')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: roles
  });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, slug, description, permissionIds } = req.body;

  // Check if role already exists
  const existingRole = await Role.findOne({
    $or: [{ name }, { slug }]
  });

  if (existingRole) {
    return res.status(400).json({
      success: false,
      message: 'Role with this name or slug already exists'
    });
  }

  const roleData = {
    name,
    slug,
    description
  };

  if (permissionIds && Array.isArray(permissionIds)) {
    roleData.permissions = permissionIds;
  }

  const role = await Role.create(roleData);

  const populatedRole = await Role.findById(role._id)
    .populate('permissions', 'name module action description');

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: populatedRole
  });
});

// Permission Management
export const getPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find()
    .sort({ module: 1, action: 1 });

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      permissions,
      grouped: groupedPermissions
    }
  });
});

export const createPermission = asyncHandler(async (req, res) => {
  const { name, module, action, description } = req.body;

  // Check if permission already exists
  const existingPermission = await Permission.findOne({
    module,
    action
  });

  if (existingPermission) {
    return res.status(400).json({
      success: false,
      message: 'Permission for this module and action already exists'
    });
  }

  const permission = await Permission.create({
    name,
    module,
    action,
    description
  });

  res.status(201).json({
    success: true,
    message: 'Permission created successfully',
    data: permission
  });
});