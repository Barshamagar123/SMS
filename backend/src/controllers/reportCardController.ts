import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import PDFService from '../services/pdfService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toNumber = (val: any): number => {
  if (!val) return NaN;
  return parseInt(String(val), 10);
};

// Download single report card
export const downloadReportCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId, examId } = req.params;
    const user = req.user;

    const studentIdNum = toNumber(studentId);
    const examIdNum = toNumber(examId);

    if (isNaN(studentIdNum) || isNaN(examIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID or exam ID' });
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: studentIdNum },
      include: { user: true, class: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check permission
    if (user?.role === 'STUDENT') {
      const currentStudent = await prisma.student.findUnique({ where: { userId: user.id } });
      if (!currentStudent || currentStudent.id !== studentIdNum) {
        return res.status(403).json({ success: false, message: 'You can only download your own report card' });
      }
    }

    // Get exam result
    const examResult = await prisma.examResult.findFirst({
      where: { studentId: studentIdNum, examId: examIdNum },
      include: {
        exam: {
          include: {
            examType: true,
            subject: true,
            class: true
          }
        }
      }
    });

    if (!examResult) {
      return res.status(404).json({ success: false, message: 'Exam result not found' });
    }

    // Get all results for rank calculation
    const allResults = await prisma.examResult.findMany({
      where: { examId: examIdNum },
      orderBy: { marksObtained: 'desc' }
    });

    // Calculate rank safely
    let rank = 1;
    if (allResults && allResults.length > 0) {
      for (let i = 0; i < allResults.length; i++) {
        const result = allResults[i];
        if (result && result.studentId === studentIdNum) {
          rank = i + 1;
          break;
        }
      }
    }

    // Generate PDF
    const filePath = await PDFService.generateReportCardPDF({
      studentName: student.user?.name || 'N/A',
      rollNumber: student.rollNumber || 'N/A',
      className: student.class ? `${student.class.name} ${student.class.section}` : 'N/A',
      examName: examResult.exam?.name || 'N/A',
      examType: examResult.exam?.examType?.name || 'N/A',
      examDate: examResult.exam?.examDate || new Date(),
      subject: examResult.exam?.subject?.name || 'N/A',
      maxMarks: examResult.exam?.maxMarks || 0,
      marksObtained: examResult.marksObtained ? Number(examResult.marksObtained) : 0,
      percentage: examResult.percentage || 0,
      grade: examResult.grade || 'N/A',
      rank,
      totalStudents: allResults?.length || 0,
      remark: examResult.remark || null
    });

    const fileName = `report_card_${student.rollNumber}.pdf`;
    res.download(filePath, fileName);

  } catch (error: any) {
    console.error('Download report card error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students for bulk download
export const getStudentsForBulkDownload = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const examIdNum = toNumber(examId);

    if (isNaN(examIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examIdNum },
      include: {
        class: {
          include: {
            students: {
              where: { isActive: true },
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const results = await prisma.examResult.findMany({
      where: { examId: examIdNum }
    });

    const students = (exam.class?.students || []).map(student => {
      const result = results.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        studentName: student.user?.name || 'N/A',
        marksObtained: result ? Number(result.marksObtained) : null,
        percentage: result?.percentage,
        grade: result?.grade,
        hasResult: !!result
      };
    });

    res.json({ success: true, data: students });
  } catch (error: any) {
    console.error('Get students for bulk download error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk download report cards
export const bulkDownloadReportCards = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId } = req.params;
    const { studentIds } = req.body;
    const examIdNum = toNumber(examId);

    if (isNaN(examIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'studentIds array is required' });
    }

    const reportCards = [];

    for (const studentId of studentIds) {
      const studentIdNum = toNumber(studentId);
      if (isNaN(studentIdNum)) continue;

      const student = await prisma.student.findUnique({
        where: { id: studentIdNum },
        include: { user: true, class: true }
      });

      if (!student) continue;

      const examResult = await prisma.examResult.findFirst({
        where: { studentId: studentIdNum, examId: examIdNum },
        include: {
          exam: {
            include: {
              examType: true,
              subject: true
            }
          }
        }
      });

      if (!examResult) continue;

      const allResults = await prisma.examResult.findMany({
        where: { examId: examIdNum },
        orderBy: { marksObtained: 'desc' }
      });

      // Calculate rank safely
      let rank = 1;
      if (allResults && allResults.length > 0) {
        for (let i = 0; i < allResults.length; i++) {
          const result = allResults[i];
          if (result && result.studentId === studentIdNum) {
            rank = i + 1;
            break;
          }
        }
      }

      reportCards.push({
        studentId: studentIdNum,
        rollNumber: student.rollNumber,
        data: {
          studentName: student.user?.name || 'N/A',
          rollNumber: student.rollNumber || 'N/A',
          className: student.class ? `${student.class.name} ${student.class.section}` : 'N/A',
          examName: examResult.exam?.name || 'N/A',
          examType: examResult.exam?.examType?.name || 'N/A',
          examDate: examResult.exam?.examDate || new Date(),
          subject: examResult.exam?.subject?.name || 'N/A',
          maxMarks: examResult.exam?.maxMarks || 0,
          marksObtained: examResult.marksObtained ? Number(examResult.marksObtained) : 0,
          percentage: examResult.percentage || 0,
          grade: examResult.grade || 'N/A',
          rank,
          totalStudents: allResults?.length || 0,
          remark: examResult.remark || null
        }
      });
    }

    if (reportCards.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid report cards to generate' });
    }

    const zipPath = await PDFService.generateBulkReportCardsZip(reportCards, examIdNum);
    res.download(zipPath, `report_cards_exam_${examIdNum}.zip`);

  } catch (error: any) {
    console.error('Bulk download error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
