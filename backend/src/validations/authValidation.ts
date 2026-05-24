import { body, param } from 'express-validator';

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateRegisterPublic = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 }),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number required'),
  body('role')
    .isIn(['STUDENT', 'PARENT'])
    .withMessage('Role must be STUDENT or PARENT'),
];

export const validateCreateAdmin = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .notEmpty()
    .withMessage('Name required')
    .trim(),
];

export const validateCreateTeacher = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .notEmpty()
    .withMessage('Name required')
    .trim(),
];

export const validateApproveUser = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID required'),
  body('action')
    .isIn(['APPROVE', 'REJECT'])
    .withMessage('Action must be APPROVE or REJECT')
];

export const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

export const validateUpdateUser = [
  param('id')
    .isInt()
    .withMessage('Valid user ID required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }),
  body('isActive')
    .optional()
    .isBoolean()
];