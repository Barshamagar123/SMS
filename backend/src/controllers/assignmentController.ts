// backend/src/controllers/assignmentController.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { PrismaClient } from '@prisma/client';
import { StudentAssignmentService } from '../services/studentAssignmentService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Multer setup - Simple
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.originalUrl.includes('submit') ? 'submissions' : 'assignments';
    const dir = path.join(process.cwd(), 'uploads', type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const uploadAssignmentFiles = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).array('files', 5);
export const uploadSubmissionFiles = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).array('files', 5);

// ================= CREATE ASSIGNMENT =================
export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, classId, subjectId, dueDate, totalMarks, passingMarks } = req.body;
    
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const assignment = await StudentAssignmentService.createAssignment({
      title,
      description,
      classId: Number(classId),
      subjectId: Number(subjectId),
      teacherId: teacher.id,
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      files: (req as any).files
    });

    res.json({ success: true, message: 'Assignment created', data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MY ASSIGNMENTS (STUDENT) =================
export const getMyAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const assignments = await StudentAssignmentService.getStudentAssignments(student.id);
    res.json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE ASSIGNMENT =================
export const getAssignmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const user = req.user;
    let studentId: number | undefined;
    
    if (user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      studentId = student?.id;
    }
    
    const assignment = await StudentAssignmentService.getAssignmentById(id, studentId);
    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SUBMIT ASSIGNMENT =================
export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    if (isNaN(assignmentId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const { comment } = req.body;
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const submission = await StudentAssignmentService.submitAssignment(
      assignmentId,
      student.id,
      (req as any).files || [],
      comment
    );

    res.json({ success: true, message: 'Assignment submitted', data: submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET TEACHER ASSIGNMENTS =================
export const getTeacherAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const assignments = await StudentAssignmentService.getTeacherAssignments(teacher.id);
    res.json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GRADE SUBMISSION =================
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissionId = Number(req.params.submissionId);
    if (isNaN(submissionId)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const { marksObtained, feedback } = req.body;
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });

    const submission = await StudentAssignmentService.gradeSubmission(
      submissionId,
      Number(marksObtained),
      feedback,
      teacher?.id
    );

    res.json({ success: true, message: 'Submission graded', data: submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE ASSIGNMENT =================
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await StudentAssignmentService.deleteAssignment(id, teacher.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE ASSIGNMENT =================
export const updateAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const { title, description, dueDate, totalMarks, passingMarks } = req.body;
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (totalMarks) updateData.totalMarks = Number(totalMarks);
    if (passingMarks) updateData.passingMarks = Number(passingMarks);

    const assignment = await StudentAssignmentService.updateAssignment(id, teacher.id, updateData);
    res.json({ success: true, message: 'Assignment updated', data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DOWNLOAD FILE =================
export const downloadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fileId = Number(req.params.fileId);
    const type = req.params.type as string;
    
    if (isNaN(fileId)) return res.status(400).json({ success: false, message: 'Invalid file ID' });
    
    let fileUrl: string | null = null;

    if (type === 'assignment') {
      const file = await prisma.assignmentAttachment.findUnique({ where: { id: fileId } });
      fileUrl = file?.fileUrl || null;
    } else if (type === 'submission') {
      const file = await prisma.submissionAttachment.findUnique({ where: { id: fileId } });
      fileUrl = file?.fileUrl || null;
    }

    if (!fileUrl) return res.status(404).json({ success: false, message: 'File not found' });

    const filePath = path.join(process.cwd(), fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

    res.download(filePath);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};