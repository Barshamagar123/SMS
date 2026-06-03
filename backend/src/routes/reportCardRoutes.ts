import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import {
  downloadReportCard,
  getStudentsForBulkDownload,
  bulkDownloadReportCards
} from '../controllers/reportCardController.js';

const router = Router();

// Download single report card
router.get('/student/:studentId/exam/:examId', authenticate, downloadReportCard);

// Get students for bulk download (Admin/Teacher)
router.get('/exam/:examId/students', authenticate, getStudentsForBulkDownload);

// Bulk download report cards (Admin/Teacher)
router.post('/exam/:examId/bulk-download', authenticate, bulkDownloadReportCards);
// router.get('/my-cards', authenticate, getMyReportCards);
export default router;