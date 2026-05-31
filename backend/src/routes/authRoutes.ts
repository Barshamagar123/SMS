import { Router } from 'express';
import authController from '../controllers/authController.js';
import { uploadStudentPhotoMiddleware, uploadTeacherPhotoMiddleware } from '../controllers/authController.js';
import {
  authenticate,
  requireSuperAdmin,
  requireAdmin
} from '../middleware/authMiddleware.js';
import {
  validateLogin,
  validateRegisterPublic,
  validateCreateAdmin,
  validateCreateTeacher,
  validateCreateStudent,
  validateApproveUser,
  validateUpdateUser
} from '../validations/authValidation.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// ========================= PUBLIC ROUTES =========================

// LOGIN
router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

// PUBLIC REGISTER (Only PARENT allowed)
router.post(
  '/register/public',
  validateRegisterPublic,
  handleValidationErrors,
  authController.publicRegister
);

// FORGOT PASSWORD
router.post('/forgot-password', authController.forgotPassword);

// RESET PASSWORD
router.post('/reset-password', authController.resetPassword);

// REFRESH TOKEN
router.post('/refresh', authController.refresh);

// ========================= SUPERADMIN ONLY =========================

// CREATE ADMIN
router.post(
  '/admin/create',
  authenticate,
  requireSuperAdmin,
  validateCreateAdmin,
  handleValidationErrors,
  authController.createAdmin
);

// GET ALL ADMINS (SuperAdmin only)
router.get(
  '/superadmin/admins',
  authenticate,
  requireSuperAdmin,
  authController.getAllAdmins
);

// ========================= TEACHER SELF ROUTES (SPECIFIC - MUST COME FIRST) =========================

// Get own teacher profile
router.get(
  '/teachers/me',
  authenticate,
  authController.getOwnTeacherProfile
);

// Upload teacher profile photo
router.post(
  '/teachers/me/photo',
  authenticate,
  uploadTeacherPhotoMiddleware,
  authController.uploadTeacherProfilePhoto
);

// Get teacher profile photo
router.get(
  '/teachers/me/photo',
  authenticate,
  authController.getTeacherProfilePhoto
);

// Delete teacher profile photo
router.delete(
  '/teachers/me/photo',
  authenticate,
  authController.deleteTeacherProfilePhoto
);

// ========================= ADMIN ONLY TEACHER MANAGEMENT ROUTES =========================

// CREATE TEACHER
router.post(
  '/teacher/create',
  authenticate,
  requireAdmin,
  validateCreateTeacher,
  handleValidationErrors,
  authController.createTeacher
);

// GET ALL TEACHERS
router.get(
  '/teachers',
  authenticate,
  requireAdmin,
  authController.getAllTeachers
);

// GET TEACHER BY ID
router.get(
  '/teachers/:id',
  authenticate,
  requireAdmin,
  authController.getTeacherById
);

// UPDATE TEACHER
router.put(
  '/teachers/:id',
  authenticate,
  requireAdmin,
  authController.updateTeacher
);

// DELETE TEACHER
router.delete(
  '/teachers/:id',
  authenticate,
  requireAdmin,
  authController.deleteTeacher
);

// GET TEACHER PHOTO BY ID (For Admin/SuperAdmin)
router.get(
  '/teachers/:id/photo',
  authenticate,
  requireAdmin,
  authController.getTeacherPhotoById
);

// RESET TEACHER PASSWORD (Admin & SuperAdmin)
router.post(
  '/teachers/:id/reset-password',
  authenticate,
  requireAdmin,
  authController.resetTeacherPassword
);

// UPDATE TEACHER STATUS (Activate/Deactivate)
router.patch(
  '/teachers/:id/status',
  authenticate,
  requireAdmin,
  authController.updateTeacherStatus
);

// ========================= STUDENT MANAGEMENT ROUTES (Admin Only) =========================

// CREATE STUDENT
router.post(
  '/student/create',
  authenticate,
  requireAdmin,
  validateCreateStudent,
  handleValidationErrors,
  authController.createStudent
);

// TRANSFER STUDENT (Admin only)
router.post(
  '/students/:id/transfer',
  authenticate,
  requireAdmin,
  authController.transferStudent
);

// APPROVE USER (for parent registrations)
router.post(
  '/users/approve',
  authenticate,
  requireAdmin,
  validateApproveUser,
  handleValidationErrors,
  authController.approveOrRejectUser
);

// GET ALL USERS
router.get('/users', authenticate, requireAdmin, authController.getAllUsers);

// UPDATE USER
router.put(
  '/users/:id',
  authenticate,
  requireAdmin,
  validateUpdateUser,
  handleValidationErrors,
  authController.updateUser
);

// DELETE USER
router.delete('/users/:id', authenticate, requireAdmin, authController.deleteUser);

// ========================= STUDENT SELF ROUTES =========================

// Get own full profile
router.get('/me/profile', authenticate, authController.getOwnProfile);

// Update own profile (limited fields)
router.put('/me/profile', authenticate, authController.updateOwnProfile);

// Upload profile photo
router.post('/me/photo', authenticate, uploadStudentPhotoMiddleware, authController.uploadOwnProfilePhoto);

// Get profile photo
router.get('/me/photo', authenticate, authController.getOwnProfilePhoto);

// Delete profile photo
router.delete('/me/photo', authenticate, authController.deleteOwnProfilePhoto);

// ========================= AUTHENTICATED USER =========================

// GET CURRENT USER (Basic info)
router.get('/me', authenticate, authController.getMe);

// LOGOUT
router.post('/logout', authenticate, authController.logout);

// CHANGE PASSWORD
router.post('/change-password', authenticate, authController.changePassword);

// ========================= SUPERADMIN/ADMIN STUDENT MANAGEMENT ROUTES =========================

// GET ALL STUDENTS WITH FULL DETAILS (Admin & SuperAdmin)
router.get(
  '/superadmin/students',
  authenticate,
  requireAdmin,
  authController.getAllStudentsWithDetails
);

// GET STUDENT STATISTICS (Admin & SuperAdmin)
router.get(
  '/students/statistics',
  authenticate,
  requireAdmin,
  authController.getStudentStatistics
);

// EXPORT STUDENTS DATA (Admin & SuperAdmin)
router.get(
  '/students/export',
  authenticate,
  requireAdmin,
  authController.exportStudentsData
);

// GET STUDENT DETAILS BY ID (Admin & SuperAdmin)
router.get(
  '/students/:id/details',
  authenticate,
  requireAdmin,
  authController.getStudentDetailsById
);

// GET STUDENT PHOTO BY ID (Admin & SuperAdmin)
router.get(
  '/students/:id/photo',
  authenticate,
  requireAdmin,
  authController.getStudentPhotoById
);

// UPDATE STUDENT STATUS (Activate/Deactivate)
router.patch(
  '/students/:id/status',
  authenticate,
  requireAdmin,
  authController.updateStudentStatus
);

// RESET STUDENT PASSWORD (Admin & SuperAdmin)
router.post(
  '/students/:id/reset-password',
  authenticate,
  requireAdmin,
  authController.resetStudentPassword
);

export default router;