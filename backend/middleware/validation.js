import { body, query, param, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('user_type')
    .isIn(['tenant', 'landlord', 'both'])
    .withMessage('User type must be tenant, landlord, or both'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  handleValidationErrors
];

export const validateResetPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

// User validations
export const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('user_type')
    .isIn(['tenant', 'landlord', 'both'])
    .withMessage('User type must be tenant, landlord, or both'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be active, inactive, or pending'),
  
  handleValidationErrors
];

export const validateUpdateUser = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be active, inactive, or pending'),
  
  handleValidationErrors
];

// Property validations
export const validateCreateProperty = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('property_type')
    .isIn(['apartment', 'house', 'villa', 'plot', 'commercial', 'office'])
    .withMessage('Invalid property type'),
  
  body('listing_type')
    .isIn(['rent', 'sale', 'both'])
    .withMessage('Listing type must be rent, sale, or both'),
  
  body('monthly_rent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('sale_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number'),
  
  body('area')
    .isFloat({ min: 1 })
    .withMessage('Area must be at least 1'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('zipcode')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit zipcode'),
  
  handleValidationErrors
];

// Query parameter validations
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Staff validations
export const validateCreateStaff = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('role_id')
    .isMongoId()
    .withMessage('Invalid role ID'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Status must be active, inactive, or suspended'),
  
  handleValidationErrors
];

// Task validations
export const validateCreateTask = [
  body('staff_id')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('property_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  body('task_type')
    .isIn(['visit', 'maintenance', 'onboarding', 'verification'])
    .withMessage('Invalid task type'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  body('due_date')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  
  handleValidationErrors
];

// Subscription validations
export const validateCreateSubscriptionPlan = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Plan name must be between 2 and 50 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('duration_days')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  
  body('visit_credits')
    .isInt({ min: 0 })
    .withMessage('Visit credits must be a non-negative integer'),
  
  body('features')
    .isArray({ min: 1 })
    .withMessage('At least one feature is required'),
  
  body('features.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Feature cannot be empty'),
  
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];