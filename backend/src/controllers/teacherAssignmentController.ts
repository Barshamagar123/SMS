import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

const prisma = new PrismaClient();

// Safe helper — req.params values are always strings at runtime
const toInt = (val: string | string[] | undefined): number =>
    parseInt(val as string, 10);

// ============================================
// ADMIN ONLY - Assign Teacher to Subject + Class
// ============================================
export const assignTeacherToSubject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { teacherId, classId, subjectId, academicYearId, isPrimary } = req.body;

        if (!teacherId || !classId || !subjectId || !academicYearId) {
            return res.status(400).json({
                success: false,
                message: 'teacherId, classId, subjectId, and academicYearId are required'
            });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacherId) }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const classSubject = await prisma.classSubject.findFirst({
            where: {
                classId: parseInt(classId),
                subjectId: parseInt(subjectId)
            }
        });

        if (!classSubject) {
            return res.status(404).json({
                success: false,
                message: 'Subject is not assigned to this class. Please assign subject to class first.'
            });
        }

        const academicYear = await prisma.academicYear.findUnique({
            where: { id: parseInt(academicYearId) }
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        const existing = await prisma.teacherAssignment.findFirst({
            where: {
                teacherId: parseInt(teacherId),
                classSubjectId: classSubject.id,
                academicYearId: parseInt(academicYearId)
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This teacher is already assigned to this subject in this class for this academic year'
            });
        }

        const assignment = await prisma.teacherAssignment.create({
            data: {
                teacherId: parseInt(teacherId),
                classSubjectId: classSubject.id,
                academicYearId: parseInt(academicYearId),
                isPrimary: isPrimary !== undefined ? isPrimary : true
            },
            include: {
                teacher: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Teacher assigned successfully',
            data: {
                id: assignment.id,
                teacher: {
                    id: assignment.teacher.id,
                    name: assignment.teacher.user.name,
                    employeeId: assignment.teacher.employeeId
                },
                class: {
                    id: assignment.classSubject.class.id,
                    name: assignment.classSubject.class.name,
                    section: assignment.classSubject.class.section
                },
                subject: assignment.classSubject.subject,
                academicYear: assignment.academicYear.year,
                isPrimary: assignment.isPrimary
            }
        });

    } catch (error: any) {
        console.error('Assign teacher error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// ADMIN & TEACHER - Get All Assignments
// ============================================
export const getAllAssignments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        let whereClause: any = {};

        if (user?.role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: user.id }
            });
            if (teacher) {
                whereClause = { teacherId: teacher.id };
            }
        }

        const assignments = await prisma.teacherAssignment.findMany({
            where: whereClause,
            include: {
                teacher: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedAssignments = assignments.map(a => ({
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

        return res.status(200).json({
            success: true,
            data: formattedAssignments,
            count: formattedAssignments.length
        });

    } catch (error: any) {
        console.error('Get assignments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// ADMIN ONLY - Delete Teacher Assignment
// ============================================
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        const assignment = await prisma.teacherAssignment.findUnique({
            where: { id },
            include: {
                teacher: {
                    include: { user: true }
                },
                classSubject: {
                    include: { class: true, subject: true }
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        await prisma.teacherAssignment.delete({ where: { id } });

        return res.status(200).json({
            success: true,
            message: `Teacher ${assignment.teacher.user.name} removed from ${assignment.classSubject.class.name} ${assignment.classSubject.class.section} - ${assignment.classSubject.subject.name}`,
            data: {
                teacherName: assignment.teacher.user.name,
                className: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`,
                subjectName: assignment.classSubject.subject.name
            }
        });

    } catch (error: any) {
        console.error('Delete assignment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// Get Teacher's Assigned Classes (Teacher Dashboard)
// ============================================
export const getTeacherClasses = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (user?.role !== 'TEACHER') {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can access this'
            });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { userId: user.id }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher profile not found'
            });
        }

        // Get active academic year assignments
        const assignments = await prisma.teacherAssignment.findMany({
            where: {
                teacherId: teacher.id,
                academicYear: { isActive: true }
            },
            include: {
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            }
        });

        const classes = assignments.map(ta => ({
            classId: ta.classSubject.class.id,
            className: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
            displayName: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
            subjectId: ta.classSubject.subject.id,
            subjectName: ta.classSubject.subject.name,
            subjectCode: ta.classSubject.subject.code,
            isPrimary: ta.isPrimary
        }));

        return res.status(200).json({
            success: true,
            data: {
                teacherId: teacher.id,
                teacherName: user.name,
                classes
            }
        });

    } catch (error: any) {
        console.error('Get teacher classes error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// Get Students by Class (without attendance status)
// ============================================
export const getStudentsByClass = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { classId } = req.params;
        const userId = req.user?.id;
        
        const classIdNum = toInt(classId);
        if (isNaN(classIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid class ID' });
        }
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        const teacher = await prisma.teacher.findUnique({
            where: { userId: userId }
        });
        
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        
        const assignment = await prisma.teacherAssignment.findFirst({
            where: {
                teacherId: teacher.id,
                classSubject: { classId: classIdNum }
            },
            include: {
                classSubject: {
                    include: {
                        class: true
                    }
                }
            }
        });
        
        if (!assignment) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not assigned to this class' 
            });
        }
        
        const students = await prisma.student.findMany({
            where: { 
                classId: classIdNum, 
                isActive: true 
            },
            include: { 
                user: { 
                    select: { 
                        id: true,
                        name: true, 
                        email: true,
                        phone: true
                    } 
                } 
            },
            orderBy: { rollNumber: 'asc' }
        });
        
        const formattedStudents = students.map(s => ({
            id: s.id,
            rollNumber: s.rollNumber,
            name: s.user.name,
            email: s.user.email,
            phone: s.user.phone,
            parentPhone: s.parentPhone,
            admissionDate: s.admissionDate
        }));
        
        const className = assignment.classSubject.class ? 
            `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}` : 
            'Unknown Class';
        
        res.json({ 
            success: true, 
            data: {
                classId: classIdNum,
                className: className,
                students: formattedStudents,
                count: formattedStudents.length
            }
        });
        
    } catch (error: any) {
        console.error('Get students by class error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// Get Teacher Schedule/Timetable
// ============================================
export const getTeacherSchedule = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        const teacher = await prisma.teacher.findUnique({
            where: { userId: userId },
            include: { user: true }
        });
        
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        
        const activeYear = await prisma.academicYear.findFirst({
            where: { isActive: true }
        });
        
        if (!activeYear) {
            return res.status(404).json({ success: false, message: 'No active academic year found' });
        }
        
        const assignments = await prisma.teacherAssignment.findMany({
            where: {
                teacherId: teacher.id,
                academicYearId: activeYear.id
            },
            include: {
                classSubject: {
                    include: {
                        class: true,
                        subject: true
                    }
                }
            }
        });
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        const timeSlots = [
            { time: '08:00 AM - 09:00 AM', slot: 1 },
            { time: '09:00 AM - 10:00 AM', slot: 2 },
            { time: '10:00 AM - 11:00 AM', slot: 3 },
            { time: '11:00 AM - 12:00 PM', slot: 4 },
            { time: '12:00 PM - 01:00 PM', slot: 5 },
            { time: '02:00 PM - 03:00 PM', slot: 6 },
            { time: '03:00 PM - 04:00 PM', slot: 7 }
        ];
        
        const schedule = days.map((day, dayIndex) => {
            const daySchedule = timeSlots.map((timeSlot, slotIndex) => {
                const assignmentIndex = (dayIndex * timeSlots.length + slotIndex) % assignments.length;
                const assignment = assignments[assignmentIndex];
                
                if (assignment && assignmentIndex < assignments.length) {
                    return {
                        time: timeSlot.time,
                        classId: assignment.classSubject.class.id,
                        className: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`,
                        subjectId: assignment.classSubject.subject.id,
                        subjectName: assignment.classSubject.subject.name,
                        subjectCode: assignment.classSubject.subject.code,
                        room: `Room ${100 + assignment.classSubject.class.id}`,
                        isPrimary: assignment.isPrimary
                    };
                }
                return null;
            }).filter(Boolean);
            
            return {
                day,
                classes: daySchedule
            };
        });
        
        res.json({
            success: true,
            data: {
                teacherId: teacher.id,
                teacherName: teacher.user?.name || 'Teacher',
                academicYear: activeYear.year,
                schedule
            }
        });
        
    } catch (error: any) {
        console.error('Get teacher schedule error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// Get Teacher's All Exam Results Summary
// ============================================
export const getMyResultsSummary = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { academicYearId } = req.query;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        const teacher = await prisma.teacher.findUnique({
            where: { userId: userId },
            include: { user: true }
        });
        
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        
        const assignments = await prisma.teacherAssignment.findMany({
            where: {
                teacherId: teacher.id,
                ...(academicYearId ? { academicYearId: parseInt(academicYearId as string) } : {})
            },
            include: {
                classSubject: {
                    include: {
                        class: true,
                        subject: true
                    }
                },
                academicYear: true
            }
        });
        
        const resultsSummary = [];
        
        for (const assignment of assignments) {
            const exams = await prisma.exam.findMany({
                where: {
                    classId: assignment.classSubject.class.id,
                    subjectId: assignment.classSubject.subject.id,
                    ...(academicYearId ? { academicYearId: parseInt(academicYearId as string) } : {})
                },
                include: {
                    examType: true,
                    results: {
                        include: {
                            student: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            });
            
            for (const exam of exams) {
                const totalStudents = exam.results.length;
                const passedStudents = exam.results.filter(r => 
                    Number(r.marksObtained) >= exam.passingMarks
                ).length;
                const averageMarks = exam.results.length > 0 
                    ? exam.results.reduce((sum, r) => sum + Number(r.marksObtained), 0) / exam.results.length
                    : 0;
                const highestMarks = exam.results.length > 0
                    ? Math.max(...exam.results.map(r => Number(r.marksObtained)))
                    : 0;
                const lowestMarks = exam.results.length > 0
                    ? Math.min(...exam.results.map(r => Number(r.marksObtained)))
                    : 0;
                
                resultsSummary.push({
                    examId: exam.id,
                    examName: exam.name,
                    examType: exam.examType.name,
                    examDate: exam.examDate,
                    className: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`,
                    subjectName: assignment.classSubject.subject.name,
                    maxMarks: exam.maxMarks,
                    passingMarks: exam.passingMarks,
                    isLocked: exam.isLocked,
                    statistics: {
                        totalStudents,
                        passedStudents,
                        failedStudents: totalStudents - passedStudents,
                        passPercentage: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0,
                        averageMarks: averageMarks.toFixed(2),
                        highestMarks,
                        lowestMarks
                    }
                });
            }
        }
        
        resultsSummary.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        
        res.json({
            success: true,
            data: {
                teacherId: teacher.id,
                teacherName: teacher.user?.name || 'Teacher',
                totalExams: resultsSummary.length,
                results: resultsSummary
            }
        });
        
    } catch (error: any) {
        console.error('Get my results summary error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// ACADEMIC YEAR CRUD OPERATIONS
// ============================================

export const createAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { year, startDate, endDate, isActive } = req.body;

        if (!year || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'year, startDate, and endDate are required'
            });
        }

        const existing = await prisma.academicYear.findUnique({
            where: { year }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Academic year ${year} already exists`
            });
        }

        if (isActive === true) {
            await prisma.academicYear.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        const academicYear = await prisma.academicYear.create({
            data: {
                year,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Academic year created successfully',
            data: academicYear
        });

    } catch (error: any) {
        console.error('Create academic year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const getAllAcademicYears = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const academicYears = await prisma.academicYear.findMany({
            orderBy: { year: 'desc' }
        });

        return res.status(200).json({
            success: true,
            data: academicYears,
            count: academicYears.length
        });

    } catch (error: any) {
        console.error('Get academic years error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getActiveAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const activeYear = await prisma.academicYear.findFirst({
            where: { isActive: true }
        });

        if (!activeYear) {
            return res.status(404).json({
                success: false,
                message: 'No active academic year found'
            });
        }

        return res.status(200).json({
            success: true,
            data: activeYear
        });

    } catch (error: any) {
        console.error('Get active academic year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAcademicYearById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        const academicYear = await prisma.academicYear.findUnique({
            where: { id },
            include: {
                teacherAssignments: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        },
                        classSubject: {
                            include: {
                                class: true,
                                subject: true
                            }
                        }
                    }
                }
            }
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: academicYear
        });

    } catch (error: any) {
        console.error('Get academic year by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);
        const { year, startDate, endDate, isActive } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        const existingYear = await prisma.academicYear.findUnique({
            where: { id }
        });

        if (!existingYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        if (year && year !== existingYear.year) {
            const duplicate = await prisma.academicYear.findUnique({
                where: { year }
            });
            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: `Academic year ${year} already exists`
                });
            }
        }

        if (isActive === true) {
            await prisma.academicYear.updateMany({
                where: {
                    isActive: true,
                    NOT: { id }
                },
                data: { isActive: false }
            });
        }

        const updatedYear = await prisma.academicYear.update({
            where: { id },
            data: {
                year: year || existingYear.year,
                startDate: startDate ? new Date(startDate) : existingYear.startDate,
                endDate: endDate ? new Date(endDate) : existingYear.endDate,
                isActive: isActive !== undefined ? isActive : existingYear.isActive
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Academic year updated successfully',
            data: updatedYear
        });

    } catch (error: any) {
        console.error('Update academic year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export const setActiveYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        const year = await prisma.academicYear.findUnique({
            where: { id }
        });

        if (!year) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        await prisma.academicYear.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        const activeYear = await prisma.academicYear.update({
            where: { id },
            data: { isActive: true }
        });

        return res.status(200).json({
            success: true,
            message: `Academic year ${activeYear.year} set as active successfully`,
            data: activeYear
        });

    } catch (error: any) {
        console.error('Set active year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        const year = await prisma.academicYear.findUnique({
            where: { id },
            include: {
                teacherAssignments: true
            }
        });

        if (!year) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        if (year.teacherAssignments.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete academic year. It has ${year.teacherAssignments.length} teacher assignment(s). Remove assignments first.`
            });
        }

        await prisma.academicYear.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: `Academic year ${year.year} deleted successfully`
        });

    } catch (error: any) {
        console.error('Delete academic year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAssignmentsByAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const academicYearId = toInt(req.params.academicYearId);
        const user = req.user;

        if (isNaN(academicYearId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        const academicYear = await prisma.academicYear.findUnique({
            where: { id: academicYearId }
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        let whereClause: any = {
            academicYearId: academicYearId
        };

        if (user?.role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: user.id }
            });
            if (teacher) {
                whereClause.teacherId = teacher.id;
            }
        }

        const assignments = await prisma.teacherAssignment.findMany({
            where: whereClause,
            include: {
                teacher: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedAssignments = assignments.map(a => ({
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
            isPrimary: a.isPrimary,
            assignedAt: a.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: {
                academicYear: {
                    id: academicYear.id,
                    year: academicYear.year,
                    startDate: academicYear.startDate,
                    endDate: academicYear.endDate,
                    isActive: academicYear.isActive
                },
                assignments: formattedAssignments,
                count: formattedAssignments.length
            }
        });

    } catch (error: any) {
        console.error('Get assignments by academic year error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getCurrentYearAssignments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        const activeYear = await prisma.academicYear.findFirst({
            where: { isActive: true }
        });

        if (!activeYear) {
            return res.status(404).json({
                success: false,
                message: 'No active academic year found'
            });
        }

        let whereClause: any = {
            academicYearId: activeYear.id
        };

        if (user?.role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: user.id }
            });
            if (teacher) {
                whereClause.teacherId = teacher.id;
            }
        }

        const assignments = await prisma.teacherAssignment.findMany({
            where: whereClause,
            include: {
                teacher: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                classSubject: {
                    include: { class: true, subject: true }
                },
                academicYear: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedAssignments = assignments.map(a => ({
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
            isPrimary: a.isPrimary,
            assignedAt: a.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: {
                academicYear: {
                    id: activeYear.id,
                    year: activeYear.year,
                    startDate: activeYear.startDate,
                    endDate: activeYear.endDate,
                    isActive: activeYear.isActive
                },
                assignments: formattedAssignments,
                count: formattedAssignments.length
            }
        });

    } catch (error: any) {
        console.error('Get current year assignments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};