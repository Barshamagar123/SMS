import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class SubjectService {
    // Create a new subject
    static async createSubject(data) {
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
    static async getAllSubjects(onlyActive = true) {
        return await prisma.subject.findMany({
            where: onlyActive ? { isActive: true } : {},
            orderBy: { name: 'asc' }
        });
    }
    // Get subject by ID
    static async getSubjectById(id) {
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
    static async updateSubject(id, data) {
        const existingSubject = await prisma.subject.findUnique({
            where: { id }
        });
        if (!existingSubject) {
            throw new Error('Subject not found');
        }
        // Check for duplicate if name or code is being changed
        if (data.name || data.code) {
            // Build OR conditions dynamically to avoid passing undefined to Prisma's strict filter
            const orConditions = [];
            if (data.name)
                orConditions.push({ name: data.name });
            if (data.code)
                orConditions.push({ code: data.code });
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
    static async deleteSubject(id) {
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
    static async subjectExists(id) {
        const subject = await prisma.subject.findUnique({
            where: { id }
        });
        return !!subject;
    }
}
export default SubjectService;
//# sourceMappingURL=subjectService.js.map