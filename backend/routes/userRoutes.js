import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  blockUser,
  deleteUser,
  bulkDeleteUsers,
  getUserLoginHistory,
  getUserStats,
  exportUsers
} from '../controllers/userController.js';
import { protect, adminOnly, hasPermission } from '../middleware/auth.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validatePagination,
  validateId
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', protect, adminOnly, validatePagination, getUsers);
router.get('/stats', protect, adminOnly, getUserStats);
router.get('/export', protect, adminOnly, exportUsers);
router.get('/:id', protect, adminOnly, validateId, getUserById);
router.post('/', protect, hasPermission('users', 'create'), validateCreateUser, createUser);
router.put('/:id', protect, hasPermission('users', 'update'), validateUpdateUser, updateUser);
router.patch('/:id/status', protect, hasPermission('users', 'update'), validateId, updateUserStatus);
router.patch('/:id/block', protect, hasPermission('users', 'update'), validateId, blockUser);
router.delete('/:id', protect, hasPermission('users', 'delete'), validateId, deleteUser);
router.post('/bulk-delete', protect, hasPermission('users', 'delete'), bulkDeleteUsers);
router.get('/:id/logins', protect, adminOnly, validateId, getUserLoginHistory);

export default router;