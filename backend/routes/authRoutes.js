import express from 'express';
import {
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;