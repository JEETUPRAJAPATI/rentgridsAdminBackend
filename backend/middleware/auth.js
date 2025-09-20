import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { config } from '../config/config.js';

// Protect routes - General authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Check if it's admin or user
      let user;
      if (decoded.type === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      } else {
        user = await User.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      if (user.status === 'inactive') {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      req.user = user;
      req.userType = decoded.type;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin only access
export const adminOnly = async (req, res, next) => {
  try {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin access required.'
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authorization'
    });
  }
};

// Super admin only access
export const superAdminOnly = async (req, res, next) => {
  try {
    if (req.userType !== 'admin' || !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin access required.'
      });
    }
    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authorization'
    });
  }
};

// Permission-based access
export const hasPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      if (req.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin access required.'
        });
      }

      // Super admin has all permissions
      if (req.user.isSuperAdmin) {
        return next();
      }

      // Check user permissions
      const admin = await Admin.findById(req.user._id)
        .populate('permissions')
        .populate('roles');

      if (!admin) {
        return res.status(403).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Check direct permissions
      const hasDirectPermission = admin.permissions.some(
        permission => permission.module === module && permission.action === action
      );

      if (hasDirectPermission) {
        return next();
      }

      // Check role-based permissions
      for (const role of admin.roles) {
        const roleWithPermissions = await Role.findById(role._id).populate('permissions');
        const hasRolePermission = roleWithPermissions.permissions.some(
          permission => permission.module === module && permission.action === action
        );
        
        if (hasRolePermission) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. ${action} permission required for ${module} module.`
      });

    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};

// Optional authentication (for public routes that can benefit from user info)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        let user;
        if (decoded.type === 'admin') {
          user = await Admin.findById(decoded.id).select('-password');
        } else {
          user = await User.findById(decoded.id).select('-password');
        }

        if (user && user.status === 'active') {
          req.user = user;
          req.userType = decoded.type;
        }
      } catch (error) {
        // Token is invalid, but continue without user
        console.log('Optional auth - invalid token:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without user
  }
};

// Generate JWT Token
export const generateToken = (id, type = 'user') => {
  return jwt.sign(
    { id, type },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
};