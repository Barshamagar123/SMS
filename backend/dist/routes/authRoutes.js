import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate, requireSuperAdmin, requireAdmin } from '../middleware/authMiddleware.js';
import { loginLimiter, } from '../middleware/rateLimitMiddleware.js';
const router = Router();
// ========================= PUBLIC ROUTES =========================
// LOGIN (ALL USERS)
router.post('/login', loginLimiter, authController.login);
// PUBLIC REGISTRATION (STUDENT / PARENT ONLY)
router.post('/register/public', authController.publicRegister);
// ========================= SUPERADMIN ONLY =========================
// CREATE ADMIN (ONLY SUPERADMIN)
router.post('/admin/create', authenticate, requireSuperAdmin, authController.createAdmin);
// ========================= ADMIN ONLY =========================
// CREATE TEACHER
router.post('/teacher/create', authenticate, requireAdmin, authController.createTeacher);
// APPROVE / REJECT USERS
router.post('/users/approve', authenticate, requireAdmin, authController.approveOrRejectUser);
// GET ALL USERS
router.get('/users', authenticate, requireAdmin, authController.getAllUsers);
// UPDATE USER
router.put('/users/:id', authenticate, requireAdmin, authController.updateUser);
// DELETE USER
router.delete('/users/:id', authenticate, requireAdmin, authController.deleteUser);
// ========================= AUTH USER =========================
// CURRENT USER PROFILE
router.get('/me', authenticate, authController.getMe);
export default router;
//# sourceMappingURL=authRoutes.js.map