// ================= authRoutes.ts =================
import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate, requireSuperAdmin, requireAdmin } from '../middleware/authMiddleware.js';
import { validateLogin, validateRegisterPublic, validateCreateAdmin, validateCreateTeacher, validateApproveUser, validateUpdateUser } from '../validations/authValidation.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';
const router = Router();
// ========================= PUBLIC ROUTES =========================
// LOGIN
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, authController.login);
// PUBLIC REGISTER
router.post('/register/public', validateRegisterPublic, handleValidationErrors, authController.publicRegister);
// FORGOT PASSWORD
router.post('/forgot-password', authController.forgotPassword);
// RESET PASSWORD
router.post('/reset-password', authController.resetPassword);
// REFRESH TOKEN
router.post('/refresh', authController.refresh);
// ========================= SUPERADMIN =========================
// CREATE ADMIN
router.post('/admin/create', authenticate, requireSuperAdmin, validateCreateAdmin, handleValidationErrors, authController.createAdmin);
// ========================= ADMIN =========================
// CREATE TEACHER
router.post('/teacher/create', authenticate, requireAdmin, validateCreateTeacher, handleValidationErrors, authController.createTeacher);
// APPROVE USER
router.post('/users/approve', authenticate, requireAdmin, validateApproveUser, handleValidationErrors, authController.approveOrRejectUser);
// GET USERS
router.get('/users', authenticate, requireAdmin, authController.getAllUsers);
// UPDATE USER
router.put('/users/:id', authenticate, requireAdmin, validateUpdateUser, handleValidationErrors, authController.updateUser);
// DELETE USER
router.delete('/users/:id', authenticate, requireAdmin, authController.deleteUser);
// ========================= AUTH USER =========================
// GET CURRENT USER
router.get('/me', authenticate, authController.getMe);
// LOGOUT
router.post('/logout', authenticate, authController.logout);
// CHANGE PASSWORD
router.post('/change-password', authenticate, authController.changePassword);
export default router;
//# sourceMappingURL=authRoutes.js.map