import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';
import ExcelJS from 'exceljs';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    user_type = '',
    is_blocked = ''
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) filter.status = status;
  if (user_type) filter.user_type = user_type;
  if (is_blocked !== '') filter.is_blocked = is_blocked === 'true';

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const users = await User.find(filter)
    .select('-password -reset_password_token -reset_password_expire')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -reset_password_token -reset_password_expire')
    .populate('created_by', 'name email');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    status,
    user_type,
    address,
    dob,
    gender
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or phone already exists'
    });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    status,
    user_type,
    address,
    dob,
    gender,
    created_by: req.user._id
  });

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Fields that can be updated
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    status: req.body.status,
    user_type: req.body.user_type,
    dob: req.body.dob,
    gender: req.body.gender
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  user = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: user
  });
});

// @desc    Block/Unblock user
// @route   PATCH /api/admin/users/:id/block
// @access  Private/Admin
export const blockUser = asyncHandler(async (req, res) => {
  const { is_blocked } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { is_blocked },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const action = is_blocked ? 'blocked' : 'unblocked';
  
  res.json({
    success: true,
    message: `User ${action} successfully`,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Bulk delete users
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs array is required'
    });
  }

  const result = await User.deleteMany({
    _id: { $in: userIds }
  });

  res.json({
    success: true,
    message: `${result.deletedCount} users deleted successfully`,
    deletedCount: result.deletedCount
  });
});

// @desc    Get user login history
// @route   GET /api/admin/users/:id/logins
// @access  Private/Admin
export const getUserLoginHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const user = await User.findById(req.params.id)
    .select('name email last_login createdAt');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // For now, return basic login info
  // In a real app, you'd have a separate LoginHistory model
  res.json({
    success: true,
    data: {
      user: {
        name: user.name,
        email: user.email,
        last_login: user.last_login,
        created_at: user.createdAt
      },
      login_history: [] // Would contain actual login records
    }
  });
});

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const blockedUsers = await User.countDocuments({ is_blocked: true });
  const tenants = await User.countDocuments({ user_type: 'tenant' });
  const landlords = await User.countDocuments({ user_type: 'landlord' });
  
  // Get new users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  res.json({
    success: true,
    data: {
      total_users: totalUsers,
      active_users: activeUsers,
      blocked_users: blockedUsers,
      tenants,
      landlords,
      new_users_this_month: newUsersThisMonth,
      user_growth_rate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(2) : 0
    }
  });
});

// @desc    Export users to Excel
// @route   GET /api/admin/users/export
// @access  Private/Admin
export const exportUsers = asyncHandler(async (req, res) => {
  const { status = '', user_type = '', is_blocked = '' } = req.query;

  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (user_type) filter.user_type = user_type;
  if (is_blocked !== '') filter.is_blocked = is_blocked === 'true';

  const users = await User.find(filter)
    .select('-password -reset_password_token -reset_password_expire')
    .sort({ createdAt: -1 });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  // Define columns
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'User Type', key: 'user_type', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Blocked', key: 'is_blocked', width: 12 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  // Add data
  users.forEach(user => {
    worksheet.addRow({
      name: user.name,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      status: user.status,
      is_blocked: user.is_blocked ? 'Yes' : 'No',
      createdAt: user.createdAt.toDateString()
    });
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
});