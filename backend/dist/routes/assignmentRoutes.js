import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { createAssignment, getMyAssignments, getAssignmentById, submitAssignment, getTeacherAssignments, gradeSubmission, deleteAssignment, updateAssignment, downloadFile, uploadAssignmentFiles, uploadSubmissionFiles } from '../controllers/assignmentController.js';
const router = Router();
// Student routes
router.get('/my-assignments', authenticate, getMyAssignments);
router.get('/:id', authenticate, getAssignmentById);
router.post('/submit/:assignmentId', authenticate, uploadSubmissionFiles, submitAssignment);
// Teacher routes
router.post('/', authenticate, uploadAssignmentFiles, createAssignment);
router.get('/teacher/assignments', authenticate, getTeacherAssignments);
router.put('/:id', authenticate, updateAssignment);
router.delete('/:id', authenticate, deleteAssignment);
router.post('/grade/:submissionId', authenticate, gradeSubmission);
// Download
router.get('/download/:type/:fileId', authenticate, downloadFile);
export default router;
//# sourceMappingURL=assignmentRoutes.js.map