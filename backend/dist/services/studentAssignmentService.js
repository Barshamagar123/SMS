// backend/src/services/studentAssignmentService.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotificationService } from './notificationService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
export class StudentAssignmentService {
    static async createAssignment(data) {
        const assignment = await prisma.assignment.create({
            data: {
                title: data.title,
                description: data.description || null,
                classId: data.classId,
                subjectId: data.subjectId,
                teacherId: data.teacherId,
                dueDate: data.dueDate,
                totalMarks: data.totalMarks,
                passingMarks: data.passingMarks,
                isActive: true // ✅ Ensure assignment is active
            }
        });
        if (data.files && data.files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'assignments');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            for (const file of data.files) {
                await prisma.assignmentAttachment.create({
                    data: {
                        assignmentId: assignment.id,
                        fileName: file.originalname,
                        fileUrl: `/uploads/assignments/${file.filename}`,
                        fileSize: file.size,
                        fileType: file.mimetype,
                    }
                });
            }
        }
        await NotificationService.sendToClass(data.classId, '📝 New Assignment Posted!', `New assignment "${data.title}" has been posted. Due date: ${new Date(data.dueDate).toLocaleDateString()}`, 'ASSIGNMENT_CREATED', assignment.id);
        return assignment;
    }
    static async getStudentAssignments(studentId) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { class: true }
        });
        if (!student)
            throw new Error('Student not found');
        console.log(`📚 Fetching assignments for Student ID: ${studentId}, Class ID: ${student.classId}`);
        const assignments = await prisma.assignment.findMany({
            where: {
                classId: student.classId,
                isActive: true
            },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                attachments: true,
                submissions: { where: { studentId } }
            },
            orderBy: { createdAt: 'desc' } // ✅ Show newest first
        });
        console.log(`✅ Found ${assignments.length} assignments for class ${student.classId}`);
        assignments.forEach(a => {
            console.log(`   - ${a.title} (Subject: ${a.subject?.name}, ID: ${a.subjectId})`);
        });
        return assignments.map(assignment => ({
            ...assignment,
            status: this.getAssignmentStatus(assignment, assignment.submissions[0])
        }));
    }
    static getAssignmentStatus(assignment, submission) {
        if (submission)
            return 'SUBMITTED';
        if (new Date(assignment.dueDate) < new Date())
            return 'LATE';
        return 'PENDING';
    }
    static async getAssignmentById(assignmentId, studentId) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId, isActive: true },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                attachments: true,
                submissions: studentId ? {
                    where: { studentId },
                    include: {
                        student: { include: { user: true } },
                        attachments: true
                    }
                } : {
                    include: {
                        student: { include: { user: true } },
                        attachments: true
                    }
                }
            }
        });
        if (!assignment)
            throw new Error('Assignment not found');
        const result = {
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
            submissions: assignment.submissions
        };
        if (studentId) {
            const studentSubmission = assignment.submissions.find(s => s.studentId === studentId);
            result.status = studentSubmission ? 'SUBMITTED' : 'PENDING';
            if (studentSubmission) {
                result.submission = studentSubmission;
            }
        }
        return result;
    }
    static async submitAssignment(assignmentId, studentId, files, comment) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { teacher: { include: { user: true } } }
        });
        if (!assignment)
            throw new Error('Assignment not found');
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });
        let submission = await prisma.assignmentSubmission.findFirst({
            where: { assignmentId, studentId }
        });
        if (submission) {
            await prisma.submissionAttachment.deleteMany({
                where: { submissionId: submission.id }
            });
            submission = await prisma.assignmentSubmission.update({
                where: { id: submission.id },
                data: {
                    updatedAt: new Date(),
                    comment: comment || null
                }
            });
        }
        else {
            submission = await prisma.assignmentSubmission.create({
                data: {
                    assignmentId,
                    studentId,
                    comment: comment || null
                }
            });
        }
        if (files && files.length > 0) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'submissions');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            for (const file of files) {
                await prisma.submissionAttachment.create({
                    data: {
                        submissionId: submission.id,
                        fileName: file.originalname,
                        fileUrl: `/uploads/submissions/${file.filename}`,
                        fileSize: file.size,
                        fileType: file.mimetype,
                    }
                });
            }
        }
        await NotificationService.sendToUser(assignment.teacher.userId, '📤 Assignment Submitted', `${student?.user.name} has submitted "${assignment.title}".`, 'ASSIGNMENT_SUBMITTED', assignmentId);
        return submission;
    }
    static async gradeSubmission(submissionId, marksObtained, feedback, teacherId) {
        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: true,
                student: { include: { user: true } }
            }
        });
        if (!submission)
            throw new Error('Submission not found');
        const grade = this.calculateGrade(marksObtained, submission.assignment.totalMarks);
        const updateData = {
            marksObtained: marksObtained,
            grade: grade,
            gradedAt: new Date()
        };
        if (feedback !== undefined) {
            updateData.feedback = feedback;
        }
        if (teacherId !== undefined) {
            updateData.gradedBy = teacherId;
        }
        const updated = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: updateData
        });
        await NotificationService.sendToUser(submission.student.userId, '✅ Assignment Graded', `Your "${submission.assignment.title}" has been graded. Score: ${marksObtained}/${submission.assignment.totalMarks} (${grade})`, 'ASSIGNMENT_GRADED', submission.assignmentId);
        return updated;
    }
    static calculateGrade(marks, total) {
        const percentage = (marks / total) * 100;
        if (percentage >= 90)
            return 'A+';
        if (percentage >= 80)
            return 'A';
        if (percentage >= 70)
            return 'B+';
        if (percentage >= 60)
            return 'B';
        if (percentage >= 50)
            return 'C+';
        if (percentage >= 40)
            return 'C';
        return 'D';
    }
    static async getTeacherAssignments(teacherId) {
        const assignments = await prisma.assignment.findMany({
            where: {
                teacherId,
                isActive: true
            },
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
        return assignments;
    }
    static async deleteAssignment(assignmentId, teacherId) {
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                teacherId
            }
        });
        if (!assignment)
            throw new Error('Assignment not found');
        return prisma.assignment.update({
            where: { id: assignmentId },
            data: { isActive: false }
        });
    }
    static async updateAssignment(assignmentId, teacherId, data) {
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                teacherId
            }
        });
        if (!assignment)
            throw new Error('Assignment not found');
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate;
        if (data.totalMarks !== undefined)
            updateData.totalMarks = data.totalMarks;
        if (data.passingMarks !== undefined)
            updateData.passingMarks = data.passingMarks;
        const updated = await prisma.assignment.update({
            where: { id: assignmentId },
            data: updateData
        });
        return updated;
    }
}
//# sourceMappingURL=studentAssignmentService.js.map