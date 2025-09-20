import express from 'express';
import {
  // Staff Management
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  assignRole,
  getStaffStats,
  
  // Task Management
  getAllTasks,
  createTask,
  updateTaskStatus,
  
  // Performance Management
  getStaffPerformance,
  logPerformance
} from '../controllers/staffController.js';
import { protect, adminOnly, hasPermission } from '../middleware/auth.js';
import {
  validateCreateStaff,
  validateCreateTask,
  validatePagination,
  validateId
} from '../middleware/validation.js';
import { uploadStaffAvatar, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Staff management
router.get('/', protect, adminOnly, validatePagination, getStaff);
router.get('/stats', protect, adminOnly, getStaffStats);
router.get('/:id', protect, adminOnly, validateId, getStaffById);
router.post('/', protect, hasPermission('staff', 'create'), uploadStaffAvatar, handleUploadError, validateCreateStaff, createStaff);
router.put('/:id', protect, hasPermission('staff', 'update'), uploadStaffAvatar, handleUploadError, validateId, updateStaff);
router.delete('/:id', protect, hasPermission('staff', 'delete'), validateId, deleteStaff);
router.patch('/:id/status', protect, hasPermission('staff', 'update'), validateId, updateStaffStatus);
router.patch('/:id/assign-role', protect, hasPermission('staff', 'update'), validateId, assignRole);

// Task management
router.get('/tasks/all', protect, adminOnly, validatePagination, getAllTasks);
router.post('/tasks', protect, hasPermission('staff', 'create'), validateCreateTask, createTask);
router.patch('/tasks/:id/status', protect, hasPermission('staff', 'update'), validateId, updateTaskStatus);

// Performance management
router.get('/:id/performance', protect, adminOnly, validateId, getStaffPerformance);
router.post('/performance-log', protect, hasPermission('staff', 'create'), logPerformance);

export default router;