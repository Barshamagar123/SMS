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
            subject: {
                id: ta.classSubject.subject.id,
                name: ta.classSubject.subject.name,
                code: ta.classSubject.subject.code
            },
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
export const createAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { year, startDate, endDate, isActive } = req.body;

        // Validation
        if (!year || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'year, startDate, and endDate are required'
            });
        }

        // Check if year already exists
        const existing = await prisma.academicYear.findUnique({
            where: { year }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Academic year ${year} already exists`
            });
        }

        // If this year is set as active, deactivate all other years
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

// ============================================
// ADMIN/SUPERADMIN/TEACHER - Get All Academic Years
// ============================================
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

// ============================================
// Get Active Academic Year
// ============================================
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

// ============================================
// Get Academic Year by ID
// ============================================
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

// ============================================
// ADMIN/SUPERADMIN ONLY - Update Academic Year
// ============================================
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

        // Check if academic year exists
        const existingYear = await prisma.academicYear.findUnique({
            where: { id }
        });

        if (!existingYear) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        // If updating year, check for duplicate
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

        // If setting this year as active, deactivate all others
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

// ============================================
// ADMIN/SUPERADMIN ONLY - Set Active Year
// ============================================
export const setActiveYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        // Check if academic year exists
        const year = await prisma.academicYear.findUnique({
            where: { id }
        });

        if (!year) {
            return res.status(404).json({
                success: false,
                message: 'Academic year not found'
            });
        }

        // Deactivate all years
        await prisma.academicYear.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        // Activate this year
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

// ============================================
// ADMIN/SUPERADMIN ONLY - Delete Academic Year
// ============================================
export const deleteAcademicYear = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid academic year ID'
            });
        }

        // Check if academic year exists
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

        // Check if it has teacher assignments
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

// ============================================
// Get Assignments by Academic Year
// ============================================
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

        // Check if academic year exists
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

// ============================================
// Get Current Year Assignments
// ============================================
export const getCurrentYearAssignments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        // Get active academic year
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