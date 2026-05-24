import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { getAllClasses, getClassById, createClass, updateClass, deleteClass, getSubjectsForClass, assignSubjectToClass, removeSubjectFromClass } from '../controllers/classController.js';
const router = Router();
// Class CRUD - Admin only
router.post('/', authenticate, requireAdmin, createClass);
router.put('/:id', authenticate, requireAdmin, updateClass);
router.delete('/:id', authenticate, requireAdmin, deleteClass);
// Get classes - All authenticated users
router.get('/', authenticate, getAllClasses);
router.get('/:id', authenticate, getClassById);
// Subject assignments - Admin only for write
router.post('/:classId/subjects', authenticate, requireAdmin, assignSubjectToClass);
router.delete('/:classId/subjects/:subjectId', authenticate, requireAdmin, removeSubjectFromClass);
// Get subjects for a class - All roles (handled in controller)
router.get('/:classId/subjects', authenticate, getSubjectsForClass);
export default router;
//# sourceMappingURL=classRoutes.js.map