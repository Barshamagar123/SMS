import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getTeacherClasses,
  getStudentsForAttendance,
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  deleteAttendance,
  downloadMonthlyReport,
  downloadYearlyReport
} from '../controllers/attendanceController.js';

const router = Router();

// ========================= TEACHER ROUTES =========================

// Get all classes assigned to the logged-in teacher
router.get('/my-classes', authenticate, getTeacherClasses);

// Get students list for a specific class to mark attendance
router.get('/class/:classId/students', authenticate, getStudentsForAttendance);

// Mark attendance for a class
router.post('/class/:classId/mark', authenticate, markAttendance);

// Get attendance report for a class (monthly)
router.get('/class/:classId/report', authenticate, getClassAttendance);

// Delete an attendance record (within 7 days)
router.delete('/:id', authenticate, deleteAttendance);

// ========================= PDF REPORT DOWNLOAD ROUTES =========================

// Download monthly attendance report as PDF
router.get('/class/:classId/download-monthly', authenticate, downloadMonthlyReport);

// Download yearly attendance report as PDF
router.get('/class/:classId/download-yearly', authenticate, downloadYearlyReport);

// ========================= STUDENT/PARENT ROUTES =========================

// Get attendance for the logged-in student
router.get('/me', authenticate, getStudentAttendance);

export default router;