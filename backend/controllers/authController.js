import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

// @desc    Login user/admin
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in Admin collection first
  let user = await Admin.findOne({ email }).select('+password');
  let userType = 'admin';

  // If not found in Admin, check User collection
  if (!user) {
    user = await User.findOne({ email }).select('+password');
    userType = 'user';
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordMatched = await user.matchPassword(password);
  
  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (user.status === 'inactive') {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Check if user is blocked (only for users, not admins)
  if (userType === 'user' && user.is_blocked) {
    return res.status(401).json({
      success: false,
      message: 'Account has been blocked'
    });
  }

  // Update last login
  user.last_login = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = generateToken(user._id, userType);

  // Remove password from response
  user.password = undefined;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      access_token: token,
      user,
      user_type: userType
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists in Admin collection first
  let user = await Admin.findOne({ email });
  let userType = 'admin';

  // If not found in Admin, check User collection
  if (!user) {
    user = await User.findOne({ email });
    userType = 'user';
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following token to reset your password: ${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Email send error:', error);
    
    user.reset_password_token = undefined;
    user.reset_password_expire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;

  // Check if user exists in Admin collection first
  let user = await Admin.findOne({
    email,
    reset_password_token: token,
    reset_password_expire: { $gt: Date.now() }
  });
  
  let userType = 'admin';

  // If not found in Admin, check User collection
  if (!user) {
    user = await User.findOne({
      email,
      reset_password_token: token,
      reset_password_expire: { $gt: Date.now() }
    });
    userType = 'user';
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reset token or token has expired'
    });
  }

  // Set new password
  user.password = password;
  user.reset_password_token = undefined;
  user.reset_password_expire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      user_type: req.userType
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone
  };

  // Only allow users to update address and other personal info
  if (req.userType === 'user') {
    fieldsToUpdate.address = req.body.address;
  }

  let user;
  if (req.userType === 'admin') {
    user = await Admin.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );
  } else {
    user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});