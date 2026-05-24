import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import {
    assignTeacherToSubject,
    getAllAssignments,
    deleteAssignment,
    getTeacherClasses,
    createAcademicYear,
    getAllAcademicYears,
    getActiveAcademicYear,
    getAcademicYearById,
    updateAcademicYear,
    setActiveYear,
    deleteAcademicYear,
    getAssignmentsByAcademicYear,
    getCurrentYearAssignments
} from '../controllers/teacherAssignmentController.js';

const router = Router();

// ============================================
// Teacher Assignment Routes
// ============================================

// Admin only
router.post('/', authenticate, requireAdmin, assignTeacherToSubject);
router.delete('/:id', authenticate, requireAdmin, deleteAssignment);

// Admin & Teacher can view
router.get('/', authenticate, getAllAssignments);

// Teacher only
router.get('/my-classes', authenticate, getTeacherClasses);

// Assignment by academic year
router.get('/academic-year/:academicYearId', authenticate, getAssignmentsByAcademicYear);
router.get('/current-year', authenticate, getCurrentYearAssignments);

// ============================================
// Academic Year CRUD Routes
// ============================================

// Admin only (write operations)
router.post('/academic-years', authenticate, requireAdmin, createAcademicYear);
router.put('/academic-years/:id', authenticate, requireAdmin, updateAcademicYear);
router.delete('/academic-years/:id', authenticate, requireAdmin, deleteAcademicYear);
router.patch('/academic-years/:id/set-active', authenticate, requireAdmin, setActiveYear);

// All authenticated users can view
router.get('/academic-years', authenticate, getAllAcademicYears);
router.get('/academic-years/active', authenticate, getActiveAcademicYear);
router.get('/academic-years/:id', authenticate, getAcademicYearById);

export default router;