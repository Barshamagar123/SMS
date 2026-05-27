import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import {
  createExamType,
  getAllExamTypes,
  createExam,
  getExamsByClass,
  getExamsForTeacher,
  getStudentsForMarksEntry,
  enterMarks,
  getExamResults,
  lockExam,
  unlockExam,
  getMyExamResults,
  initializeGrades
} from '../controllers/examController.js';

const router = Router();

// ================= EXAM TYPE ROUTES =================
router.post('/types', authenticate, requireAdmin, createExamType);
router.get('/types', authenticate, getAllExamTypes);

// ================= EXAM SCHEDULE ROUTES =================
router.post('/', authenticate, requireAdmin, createExam);
router.get('/class/:classId', authenticate, getExamsByClass);
router.get('/teacher/my-exams', authenticate, getExamsForTeacher);

// ================= MARKS ENTRY ROUTES =================
router.get('/:examId/students', authenticate, getStudentsForMarksEntry);
router.post('/:examId/marks', authenticate, enterMarks);
router.get('/:examId/results', authenticate, getExamResults);

// ================= LOCK/UNLOCK ROUTES =================
router.post('/:examId/lock', authenticate, requireAdmin, lockExam);
router.post('/:examId/unlock', authenticate, requireAdmin, unlockExam);

// ================= STUDENT ROUTES =================
router.get('/my-results', authenticate, getMyExamResults);

// ================= INITIALIZATION =================
router.post('/init-grades', authenticate, requireAdmin, initializeGrades);

export default router;