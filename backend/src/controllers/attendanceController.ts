import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import AttendanceService from '../services/attendanceService.js';
import PDFService from '../services/pdfService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple helper to convert any value to number
const toNumber = (val: any): number => {
  if (!val) return NaN;
  const str = String(val);
  return parseInt(str, 10);
};

// Get teacher's classes
export const getTeacherClasses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const classes = await AttendanceService.getTeacherClasses(userId);
    res.json({ success: true, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students for marking attendance
export const getStudentsForAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    let dateStr: string | undefined;
    if (date) {
      dateStr = String(date);
    }

    const students = await AttendanceService.getStudentsByClass(classIdNum, dateStr);
    res.json({ 
      success: true, 
      data: { 
        classId: classIdNum, 
        date: dateStr || new Date().toISOString().split('T')[0], 
        students 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark attendance
export const markAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { date, attendances } = req.body;

    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    if (!date || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and attendances array are required' 
      });
    }

    await AttendanceService.markAttendance(classIdNum, date, attendances, req.user!.id);
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get class attendance report
export const getClassAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    let monthNum: number | undefined;
    let yearNum: number | undefined;
    
    if (month) {
      const m = toNumber(month);
      if (!isNaN(m)) monthNum = m;
    }
    
    if (year) {
      const y = toNumber(year);
      if (!isNaN(y)) yearNum = y;
    }

    const data = await AttendanceService.getAttendanceByClass(classIdNum, monthNum, yearNum);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student attendance (for student/parent)
export const getStudentAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const student = await prisma.student.findUnique({ 
      where: { userId } 
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const data = await AttendanceService.getStudentAttendance(student.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete attendance record
export const deleteAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const idNum = toNumber(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ success: false, message: 'Invalid attendance ID' });
    }

    await AttendanceService.deleteAttendance(idNum, req.user!.id);
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PDF REPORT DOWNLOAD FUNCTIONS =================

// Download Monthly Attendance Report as PDF
export const downloadMonthlyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    let monthNum = month ? toNumber(month) : new Date().getMonth() + 1;
    let yearNum = year ? toNumber(year) : new Date().getFullYear();

    if (isNaN(monthNum)) monthNum = new Date().getMonth() + 1;
    if (isNaN(yearNum)) yearNum = new Date().getFullYear();

    // Get detailed report data
    const reportData = await AttendanceService.getMonthlyDetailedReport(classIdNum, monthNum, yearNum);
    
    // ✅ FIX: Use totalWorkingDays (the correct property name)
    const totalDays = reportData.totalWorkingDays;
    
    // Generate PDF
    const filePath = await PDFService.generateMonthlyAttendanceReport(
      reportData.className,
      monthNum,
      yearNum,
      reportData.students,
      {},
      totalDays,
      reportData.classPercentage
    );

    const fileName = `attendance_${reportData.className.replace(/\s/g, '_')}_${monthNum}_${yearNum}.pdf`;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Error downloading file' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download Yearly Attendance Report as PDF
export const downloadYearlyReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { year } = req.query;

    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    let yearNum = year ? toNumber(year) : new Date().getFullYear();
    if (isNaN(yearNum)) yearNum = new Date().getFullYear();

    // Get detailed report data
    const reportData = await AttendanceService.getYearlyDetailedReport(classIdNum, yearNum);
    
    // Generate PDF
    const filePath = await PDFService.generateYearlyAttendanceReport(
      reportData.className,
      yearNum,
      reportData.students,
      reportData.monthlyData,
      reportData.overallPercentage
    );

    const fileName = `attendance_${reportData.className.replace(/\s/g, '_')}_YEAR_${yearNum}.pdf`;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Error downloading file' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};