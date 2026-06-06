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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const uploadAssignmentFiles = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }).array('files', 5);
export const uploadSubmissionFiles = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }).array('files', 5);

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

    res.json({ success: true, message: 'Assignment created successfully', data: assignment });
  } catch (error: any) {
    console.error('Create assignment error:', error);
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
    console.error('Get my assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE ASSIGNMENT (WITH SUBMISSIONS) =================
export const getAssignmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' });

    const user = req.user;
    let studentId: number | undefined;
    
    if (user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      studentId = student?.id;
    }
    
    // Fetch assignment with all relations including submissions
    const assignment = await prisma.assignment.findUnique({
      where: { id, isActive: true },
      include: {
        subject: true,
        teacher: { 
          include: { user: true } 
        },
        attachments: true,
        submissions: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            attachments: true
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Format submissions for response
    const formattedSubmissions = assignment.submissions.map(sub => ({
      id: sub.id,
      studentId: sub.studentId,
      student: {
        id: sub.student.id,
        rollNumber: sub.student.rollNumber,
        user: {
          id: sub.student.user.id,
          name: sub.student.user.name,
          email: sub.student.user.email
        }
      },
      submittedAt: sub.submittedAt,
      comment: sub.comment,
      marksObtained: sub.marksObtained,
      grade: sub.grade,
      feedback: sub.feedback,
      gradedBy: sub.gradedBy,
      gradedAt: sub.gradedAt,
      attachments: sub.attachments.map(att => ({
        id: att.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        fileType: att.fileType
      }))
    }));
    
    const responseData = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      teacherId: assignment.teacherId,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      isActive: assignment.isActive,
      subject: assignment.subject,
      teacher: assignment.teacher,
      attachments: assignment.attachments,
      submissions: formattedSubmissions
    };
    
    // If student is viewing, add their submission status
    if (studentId) {
      const studentSubmission = formattedSubmissions.find(s => s.studentId === studentId);
      (responseData as any).status = studentSubmission ? 'SUBMITTED' : 'PENDING';
      if (studentSubmission) {
        (responseData as any).submission = studentSubmission;
      }
    }
    
    console.log(`✅ Assignment ${id} fetched with ${formattedSubmissions.length} submissions`);
    res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('Get assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SUBMIT ASSIGNMENT =================
export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    if (isNaN(assignmentId)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' });

    const { comment } = req.body;
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const submission = await StudentAssignmentService.submitAssignment(
      assignmentId,
      student.id,
      (req as any).files || [],
      comment
    );

    res.json({ success: true, message: 'Assignment submitted successfully', data: submission });
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET TEACHER ASSIGNMENTS (WITH SUBMISSIONS) =================
export const getTeacherAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const assignments = await prisma.assignment.findMany({
      where: { teacherId: teacher.id, isActive: true },
      include: {
        class: true,
        subject: true,
        submissions: {
          include: {
            student: {
              include: { user: true }
            },
            attachments: true
          }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      class: {
        id: a.class.id,
        name: a.class.name,
        section: a.class.section
      },
      subject: a.subject,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      passingMarks: a.passingMarks,
      attachments: a.attachments,
      submissionsCount: a.submissions.length,
      gradedCount: a.submissions.filter(s => s.marksObtained !== null).length,
      submissions: a.submissions.map(s => ({
        id: s.id,
        studentId: s.studentId,
        student: {
          rollNumber: s.student.rollNumber,
          user: { name: s.student.user.name }
        },
        submittedAt: s.submittedAt,
        comment: s.comment,
        marksObtained: s.marksObtained,
        grade: s.grade,
        feedback: s.feedback,
        attachments: s.attachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl
        }))
      }))
    }));

    console.log(`✅ Teacher ${teacher.id} has ${assignments.length} assignments`);
    res.json({ success: true, data: formattedAssignments });
  } catch (error: any) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GRADE SUBMISSION =================
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const submissionId = Number(req.params.submissionId);
    if (isNaN(submissionId)) return res.status(400).json({ success: false, message: 'Invalid submission ID' });

    const { marksObtained, feedback } = req.body;
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });

    const submission = await StudentAssignmentService.gradeSubmission(
      submissionId,
      Number(marksObtained),
      feedback,
      teacher?.id
    );

    res.json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (error: any) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE ASSIGNMENT =================
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' });

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await StudentAssignmentService.deleteAssignment(id, teacher.id);
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE ASSIGNMENT =================
export const updateAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid assignment ID' });

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
    res.json({ success: true, message: 'Assignment updated successfully', data: assignment });
  } catch (error: any) {
    console.error('Update assignment error:', error);
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
    let fileName: string = '';

    if (type === 'assignment') {
      const file = await prisma.assignmentAttachment.findUnique({ where: { id: fileId } });
      fileUrl = file?.fileUrl || null;
      fileName = file?.fileName || 'assignment';
    } else if (type === 'submission') {
      const file = await prisma.submissionAttachment.findUnique({ where: { id: fileId } });
      fileUrl = file?.fileUrl || null;
      fileName = file?.fileName || 'submission';
    }

    if (!fileUrl) return res.status(404).json({ success: false, message: 'File not found' });

    const filePath = path.join(process.cwd(), fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });

    res.download(filePath, fileName);
  } catch (error: any) {
    console.error('Download file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};