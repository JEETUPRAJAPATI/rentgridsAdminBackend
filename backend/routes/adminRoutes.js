import express from 'express';
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getRoles,
  createRole,
  getPermissions,
  createPermission
} from '../controllers/adminController.js';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.js';
import { validatePagination, validateId } from '../middleware/validation.js';

const router = express.Router();

// Admin management
router.get('/admins', protect, adminOnly, validatePagination, getAdmins);
router.get('/admins/:id', protect, adminOnly, validateId, getAdminById);
router.post('/admins', protect, superAdminOnly, createAdmin);
router.put('/admins/:id', protect, superAdminOnly, validateId, updateAdmin);
router.delete('/admins/:id', protect, superAdminOnly, validateId, deleteAdmin);

// Role management
router.get('/roles', protect, adminOnly, getRoles);
router.post('/roles', protect, superAdminOnly, createRole);

// Permission management
router.get('/permissions', protect, adminOnly, getPermissions);
router.post('/permissions', protect, superAdminOnly, createPermission);

export default router;