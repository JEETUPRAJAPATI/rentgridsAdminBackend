import Staff from '../models/Staff.js';
import Task from '../models/Task.js';
import PerformanceLog from '../models/PerformanceLog.js';
import Role from '../models/Role.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPagination } from '../utils/pagination.js';

// Staff Management
export const getStaff = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    role_id = '',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) filter.status = status;
  if (role_id) filter.role_id = role_id;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const sortConfig = {};
  sortConfig[sort_by === 'created_at' ? 'createdAt' : sort_by] = sort_order === 'asc' ? 1 : -1;

  const staff = await Staff.find(filter)
    .populate('role_id', 'name description')
    .sort(sortConfig)
    .skip(skip)
    .limit(pageLimit);

  const total = await Staff.countDocuments(filter);

  res.json({
    success: true,
    data: staff,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id)
    .populate('role_id', 'name description');

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  res.json({
    success: true,
    data: staff
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, phone, role_id, status } = req.body;

  // Check if staff already exists
  const existingStaff = await Staff.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingStaff) {
    return res.status(400).json({
      success: false,
      message: 'Staff with this email or phone already exists'
    });
  }

  // Verify role exists
  const role = await Role.findById(role_id);
  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID'
    });
  }

  const staffData = {
    name,
    email,
    phone,
    role_id,
    status
  };

  // Handle avatar upload
  if (req.file) {
    staffData.avatar = `/uploads/images/${req.file.filename}`;
  }

  const staff = await Staff.create(staffData);

  const populatedStaff = await Staff.findById(staff._id)
    .populate('role_id', 'name description');

  res.status(201).json({
    success: true,
    message: 'Staff created successfully',
    data: populatedStaff
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  let staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    role_id: req.body.role_id,
    status: req.body.status,
    salary: req.body.salary,
    address: req.body.address
  };

  // Handle new avatar upload
  if (req.file) {
    fieldsToUpdate.avatar = `/uploads/images/${req.file.filename}`;
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  staff = await Staff.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  ).populate('role_id', 'name description');

  res.json({
    success: true,
    message: 'Staff updated successfully',
    data: staff
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  // Check if staff has pending tasks
  const pendingTasks = await Task.countDocuments({
    staff_id: req.params.id,
    status: { $in: ['pending', 'in-progress'] }
  });

  if (pendingTasks > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete staff member. ${pendingTasks} pending tasks assigned.`
    });
  }

  await Staff.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Staff member deleted successfully'
  });
});

export const updateStaffStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('role_id', 'name description');

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  res.json({
    success: true,
    message: 'Staff status updated successfully',
    data: staff
  });
});

export const assignRole = asyncHandler(async (req, res) => {
  const { role_id } = req.body;

  // Verify role exists
  const role = await Role.findById(role_id);
  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role ID'
    });
  }

  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { role_id },
    { new: true, runValidators: true }
  ).populate('role_id', 'name description');

  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  res.json({
    success: true,
    message: 'Role assigned successfully',
    data: staff
  });
});

export const getStaffStats = asyncHandler(async (req, res) => {
  const totalStaff = await Staff.countDocuments();
  const activeStaff = await Staff.countDocuments({ status: 'active' });
  const inactiveStaff = await Staff.countDocuments({ status: 'inactive' });
  const suspendedStaff = await Staff.countDocuments({ status: 'suspended' });

  // Staff by role
  const staffByRole = await Staff.aggregate([
    {
      $lookup: {
        from: 'roles',
        localField: 'role_id',
        foreignField: '_id',
        as: 'role'
      }
    },
    { $unwind: '$role' },
    { $group: { _id: '$role.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      total_staff: totalStaff,
      active_staff: activeStaff,
      inactive_staff: inactiveStaff,
      suspended_staff: suspendedStaff,
      staff_by_role: staffByRole
    }
  });
});

// Task Management
export const getAllTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status = '',
    staff_id = '',
    task_type = '',
    priority = '',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  const filter = {};
  
  if (status) filter.status = status;
  if (staff_id) filter.staff_id = staff_id;
  if (task_type) filter.task_type = task_type;
  if (priority) filter.priority = priority;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const sortConfig = {};
  sortConfig[sort_by === 'created_at' ? 'createdAt' : sort_by] = sort_order === 'asc' ? 1 : -1;

  const tasks = await Task.find(filter)
    .populate('staff_id', 'name email')
    .populate('property_id', 'title property_code')
    .populate('created_by', 'name email')
    .sort(sortConfig)
    .skip(skip)
    .limit(pageLimit);

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / pageLimit),
      total,
      limit: pageLimit
    }
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const {
    staff_id,
    property_id,
    task_type,
    title,
    description,
    priority,
    due_date
  } = req.body;

  // Verify staff exists
  const staff = await Staff.findById(staff_id);
  if (!staff) {
    return res.status(400).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  const task = await Task.create({
    staff_id,
    property_id,
    task_type,
    title,
    description,
    priority,
    due_date,
    created_by: req.user._id
  });

  const populatedTask = await Task.findById(task._id)
    .populate('staff_id', 'name email')
    .populate('property_id', 'title property_code')
    .populate('created_by', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populatedTask
  });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const updateData = { status };
  if (notes) updateData.notes = notes;
  if (status === 'completed') updateData.completed_at = new Date();

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
  .populate('staff_id', 'name email')
  .populate('property_id', 'title property_code');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task status updated successfully',
    data: task
  });
});

// Performance Management
export const getStaffPerformance = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;

  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  const dateFilter = {};
  if (date_from) dateFilter.$gte = new Date(date_from);
  if (date_to) dateFilter.$lte = new Date(date_to);

  const filter = { staff_id: req.params.id };
  if (Object.keys(dateFilter).length > 0) {
    filter.performance_date = dateFilter;
  }

  const performanceLogs = await PerformanceLog.find(filter)
    .populate('task_id', 'title task_type')
    .populate('logged_by', 'name email')
    .sort({ performance_date: -1 });

  // Calculate average performance
  const avgScore = performanceLogs.length > 0 
    ? performanceLogs.reduce((sum, log) => sum + log.score, 0) / performanceLogs.length
    : 0;

  // Get task completion stats
  const taskStats = await Task.aggregate([
    { $match: { staff_id: staff._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      staff: {
        name: staff.name,
        email: staff.email,
        role: staff.role_id
      },
      average_score: Math.round(avgScore * 100) / 100,
      performance_logs: performanceLogs,
      task_stats: taskStats,
      total_logs: performanceLogs.length
    }
  });
});

export const logPerformance = asyncHandler(async (req, res) => {
  const {
    staff_id,
    task_id,
    score,
    performance_date,
    remarks
  } = req.body;

  // Verify staff exists
  const staff = await Staff.findById(staff_id);
  if (!staff) {
    return res.status(400).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  const performanceLog = await PerformanceLog.create({
    staff_id,
    task_id,
    score,
    performance_date,
    remarks,
    logged_by: req.user._id
  });

  const populatedLog = await PerformanceLog.findById(performanceLog._id)
    .populate('staff_id', 'name email')
    .populate('task_id', 'title task_type')
    .populate('logged_by', 'name email');

  res.status(201).json({
    success: true,
    message: 'Performance logged successfully',
    data: populatedLog
  });
});