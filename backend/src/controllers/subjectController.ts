import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

const prisma = new PrismaClient();

// Safe helper — req.params values are always strings at runtime
const toInt = (val: string | string[] | undefined): number =>
    parseInt(val as string, 10);

// ============================================
// ADMIN ONLY - Create Subject
// ============================================
export const createSubject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: 'Name and code are required'
            });
        }

        const existingSubject = await prisma.subject.findFirst({
            where: {
                OR: [
                    { name: name },
                    { code: code }
                ]
            }
        });

        if (existingSubject) {
            return res.status(409).json({
                success: false,
                message: 'Subject with this name or code already exists'
            });
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                code,
                description: description || null
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject
        });

    } catch (error: any) {
        console.error('Create subject error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// ============================================
// ADMIN & TEACHER - Get All Subjects
// ============================================
export const getAllSubjects = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        return res.status(200).json({
            success: true,
            data: subjects,
            count: subjects.length
        });

    } catch (error: any) {
        console.error('Get subjects error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// ADMIN ONLY - Update Subject
// ============================================
export const updateSubject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);
        const { name, code, description, isActive } = req.body;

        const existingSubject = await prisma.subject.findUnique({
            where: { id }
        });

        if (!existingSubject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Check for duplicate name/code (excluding current subject)
        if (name || code) {
            const orConditions: any[] = [];
            if (name) orConditions.push({ name });
            if (code) orConditions.push({ code });

            const duplicate = await prisma.subject.findFirst({
                where: {
                    OR: orConditions,
                    NOT: { id }
                }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Another subject with this name or code already exists'
                });
            }
        }

        const updatedSubject = await prisma.subject.update({
            where: { id },
            data: {
                name: name || existingSubject.name,
                code: code || existingSubject.code,
                description: description !== undefined ? description : existingSubject.description,
                isActive: isActive !== undefined ? isActive : existingSubject.isActive
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject
        });

    } catch (error: any) {
        console.error('Update subject error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// ADMIN ONLY - Delete Subject (Soft Delete)
// ============================================
export const deleteSubject = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                classSubjects: {
                    include: {
                        class: true
                    }
                }
            }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        if (subject.classSubjects.length > 0) {
            const classNames = subject.classSubjects.map(cs => `${cs.class.name} ${cs.class.section}`).join(', ');
            return res.status(400).json({
                success: false,
                message: `Cannot delete subject. It is assigned to: ${classNames}. Remove assignments first.`
            });
        }

        await prisma.subject.update({
            where: { id },
            data: { isActive: false }
        });

        return res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete subject error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================
// Get Single Subject by ID
// ============================================
export const getSubjectById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = toInt(req.params.id);

        const subject = await prisma.subject.findUnique({
            where: { id },
            include: {
                classSubjects: {
                    include: {
                        class: true,
                        teacherAssignments: {
                            include: {
                                teacher: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: subject
        });

    } catch (error: any) {
        console.error('Get subject error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};