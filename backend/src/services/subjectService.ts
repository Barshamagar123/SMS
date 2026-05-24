import { PrismaClient, Subject } from '@prisma/client';

const prisma = new PrismaClient();

export class SubjectService {
    // Create a new subject
    static async createSubject(data: {
        name: string;
        code: string;
        description?: string;
    }): Promise<Subject> {
        // Check for duplicate
        const existing = await prisma.subject.findFirst({
            where: {
                OR: [
                    { name: data.name },
                    { code: data.code }
                ]
            }
        });

        if (existing) {
            throw new Error('Subject with this name or code already exists');
        }

        return await prisma.subject.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description || null
            }
        });
    }

    // Get all subjects
    static async getAllSubjects(onlyActive: boolean = true): Promise<Subject[]> {
        return await prisma.subject.findMany({
            where: onlyActive ? { isActive: true } : {},
            orderBy: { name: 'asc' }
        });
    }

    // Get subject by ID
    static async getSubjectById(id: number): Promise<Subject | null> {
        return await prisma.subject.findUnique({
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
    }

    // Update subject
    static async updateSubject(
        id: number,
        data: {
            name?: string;
            code?: string;
            description?: string;
            isActive?: boolean;
        }
    ): Promise<Subject> {
        const existingSubject = await prisma.subject.findUnique({
            where: { id }
        });

        if (!existingSubject) {
            throw new Error('Subject not found');
        }

        // Check for duplicate if name or code is being changed
        if (data.name || data.code) {
            // Build OR conditions dynamically to avoid passing undefined to Prisma's strict filter
            const orConditions: { name?: string; code?: string }[] = [];
            if (data.name) orConditions.push({ name: data.name });
            if (data.code) orConditions.push({ code: data.code });

            const duplicate = await prisma.subject.findFirst({
                where: { OR: orConditions, NOT: { id } }
            });

            if (duplicate) {
                throw new Error('Another subject with this name or code already exists');
            }
        }

        return await prisma.subject.update({
            where: { id },
            data: {
                name: data.name ?? existingSubject.name,
                code: data.code ?? existingSubject.code,
                description: data.description !== undefined ? data.description : existingSubject.description,
                isActive: data.isActive !== undefined ? data.isActive : existingSubject.isActive
            }
        });
    }

    // Delete subject (soft delete)
    static async deleteSubject(id: number): Promise<void> {
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
            throw new Error('Subject not found');
        }

        if (subject.classSubjects.length > 0) {
            const classNames = subject.classSubjects
                .map(cs => `${cs.class.name} ${cs.class.section}`)
                .join(', ');
            throw new Error(`Cannot delete subject. It is assigned to: ${classNames}`);
        }

        // Soft delete - just deactivate
        await prisma.subject.update({
            where: { id },
            data: { isActive: false }
        });
    }

    // Check if subject exists
    static async subjectExists(id: number): Promise<boolean> {
        const subject = await prisma.subject.findUnique({
            where: { id }
        });
        return !!subject;
    }
}

export default SubjectService;