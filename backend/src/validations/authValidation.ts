import { body } from 'express-validator';

// ================= LOGIN VALIDATION =================
export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// ================= PUBLIC REGISTER VALIDATION =================
export const validateRegisterPublic = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['PARENT']).withMessage('Only PARENT can register publicly')
];

// ================= CREATE ADMIN VALIDATION =================
export const validateCreateAdmin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

// ================= CREATE TEACHER VALIDATION =================
export const validateCreateTeacher = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

// ================= CREATE STUDENT VALIDATION =================
export const validateCreateStudent = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('classId').isInt({ min: 1 }).withMessage('Valid classId is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date format required'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Gender must be MALE, FEMALE, or OTHER'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood group'),
  body('fatherName').optional().notEmpty().withMessage('Father name is required'),
  body('parentPhone').optional().notEmpty().withMessage('Parent phone is required'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('city').optional().notEmpty().withMessage('City is required'),
  body('state').optional().notEmpty().withMessage('State is required')
];

// ================= APPROVE USER VALIDATION =================
export const validateApproveUser = [
  body('userId').isInt().withMessage('Valid userId is required'),
  body('action').isIn(['APPROVE', 'REJECT']).withMessage('Action must be APPROVE or REJECT')
];

// ================= UPDATE USER VALIDATION =================
export const validateUpdateUser = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().withMessage('Phone must be a string')
];