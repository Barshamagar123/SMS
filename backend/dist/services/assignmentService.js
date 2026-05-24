import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class AssignmentService {
    // Assign teacher to subject + class
    static async createAssignment(data) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: data.teacherId }
        });
        if (!teacher)
            throw new Error('Teacher not found');
        const classSubject = await prisma.classSubject.findFirst({
            where: { classId: data.classId, subjectId: data.subjectId }
        });
        if (!classSubject)
            throw new Error('Subject is not assigned to this class. Please assign subject to class first.');
        const academicYear = await prisma.academicYear.findUnique({
            where: { id: data.academicYearId }
        });
        if (!academicYear)
            throw new Error('Academic year not found');
        const existing = await prisma.teacherAssignment.findFirst({
            where: {
                teacherId: data.teacherId,
                classSubjectId: classSubject.id,
                academicYearId: data.academicYearId
            }
        });
        if (existing)
            throw new Error('This teacher is already assigned to this subject in this class for this academic year');
        const assignment = await prisma.teacherAssignment.create({
            data: {
                teacherId: data.teacherId,
                classSubjectId: classSubject.id,
                academicYearId: data.academicYearId,
                isPrimary: data.isPrimary !== undefined ? data.isPrimary : true
            },
            include: {
                teacher: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            }
        });
        return {
            id: assignment.id,
            teacher: {
                id: assignment.teacher.id,
                name: assignment.teacher.user.name,
                employeeId: assignment.teacher.employeeId
            },
            class: {
                id: assignment.classSubject.class.id,
                name: assignment.classSubject.class.name,
                section: assignment.classSubject.class.section,
                displayName: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`
            },
            subject: assignment.classSubject.subject,
            academicYear: assignment.academicYear.year,
            isPrimary: assignment.isPrimary,
            assignedAt: assignment.createdAt
        };
    }
    // Get all assignments (with optional teacher filter)
    static async getAllAssignments(teacherId) {
        const whereClause = teacherId ? { teacherId } : {};
        const assignments = await prisma.teacherAssignment.findMany({
            where: whereClause,
            include: {
                teacher: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return assignments.map(a => ({
            id: a.id,
            teacher: {
                id: a.teacher.id,
                name: a.teacher.user.name,
                employeeId: a.teacher.employeeId
            },
            class: {
                id: a.classSubject.class.id,
                name: a.classSubject.class.name,
                section: a.classSubject.class.section,
                displayName: `${a.classSubject.class.name} ${a.classSubject.class.section}`
            },
            subject: a.classSubject.subject,
            academicYear: a.academicYear.year,
            isPrimary: a.isPrimary,
            assignedAt: a.createdAt
        }));
    }
    // Get teacher's classes for the active academic year
    static async getTeacherClasses(teacherId) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId }
        });
        if (!teacher)
            throw new Error('Teacher not found');
        // Filter at the top level — `where` inside `include.academicYear` is not valid in Prisma
        const assignments = await prisma.teacherAssignment.findMany({
            where: {
                teacherId,
                academicYear: { isActive: true }
            },
            include: {
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            }
        });
        return assignments.map(ta => ({
            classId: ta.classSubject.class.id,
            className: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
            subject: {
                id: ta.classSubject.subject.id,
                name: ta.classSubject.subject.name,
                code: ta.classSubject.subject.code
            },
            isPrimary: ta.isPrimary
        }));
    }
    // Delete assignment
    static async deleteAssignment(id) {
        const assignment = await prisma.teacherAssignment.findUnique({
            where: { id },
            include: {
                teacher: { include: { user: true } },
                classSubject: { include: { class: true, subject: true } }
            }
        });
        if (!assignment)
            throw new Error('Assignment not found');
        await prisma.teacherAssignment.delete({ where: { id } });
        return {
            teacherName: assignment.teacher.user.name,
            className: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`,
            subjectName: assignment.classSubject.subject.name
        };
    }
    // Check if assignment exists
    static async assignmentExists(id) {
        const assignment = await prisma.teacherAssignment.findUnique({ where: { id } });
        return !!assignment;
    }
}
export default AssignmentService;
//# sourceMappingURL=assignmentService.js.map