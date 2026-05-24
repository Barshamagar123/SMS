import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} from '../controllers/subjectController.js';

const router = Router();

// Admin only routes
router.post('/', authenticate, requireAdmin, createSubject);
router.put('/:id', authenticate, requireAdmin, updateSubject);
router.delete('/:id', authenticate, requireAdmin, deleteSubject);

// Admin & Teacher can view
router.get('/', authenticate, getAllSubjects);
router.get('/:id', authenticate, getSubjectById);

export default router;