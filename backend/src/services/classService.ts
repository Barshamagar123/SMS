import { PrismaClient, Class } from '@prisma/client';

const prisma = new PrismaClient();

export class ClassService {
    // Create a new class
    static async createClass(data: { name: string; section: string }): Promise<Class> {
        const existing = await prisma.class.findFirst({
            where: { name: data.name, section: data.section }
        });
        if (existing) throw new Error(`Class ${data.name} ${data.section} already exists`);

        return await prisma.class.create({
            data: { name: data.name, section: data.section }
        });
    }

    // Get all classes with stats
    static async getAllClasses() {
        const classes = await prisma.class.findMany({
            include: {
                students: { select: { id: true } },
                classSubjects: { include: { subject: true } }
            },
            orderBy: [{ name: 'asc' }, { section: 'asc' }]
        });

        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            section: cls.section,
            displayName: `${cls.name} ${cls.section}`,
            studentCount: cls.students.length,
            subjectCount: cls.classSubjects.length,
            subjects: cls.classSubjects.map(cs => cs.subject)
        }));
    }

    // Get class by ID with full details
    static async getClassById(id: number) {
        return await prisma.class.findUnique({
            where: { id },
            include: {
                students: { include: { user: true } },
                classSubjects: {
                    include: {
                        subject: true,
                        teacherAssignments: {
                            include: {
                                teacher: { 
                                    include: { 
                                        user: true 
                                    } 
                                },
                                academicYear: true
                            }
                        }
                    }
                }
            }
        });
    }

    // Update class
    static async updateClass(id: number, data: { name?: string; section?: string }): Promise<Class> {
        const existingClass = await prisma.class.findUnique({ where: { id } });
        if (!existingClass) throw new Error('Class not found');

        const newName = data.name ?? existingClass.name;
        const newSection = data.section ?? existingClass.section;

        const duplicate = await prisma.class.findFirst({
            where: { name: newName, section: newSection, NOT: { id } }
        });
        if (duplicate) throw new Error('Another class with this name and section already exists');

        return await prisma.class.update({
            where: { id },
            data: { name: newName, section: newSection }
        });
    }

    // Delete class
    static async deleteClass(id: number): Promise<void> {
        const classData = await prisma.class.findUnique({
            where: { id },
            include: { students: true, classSubjects: true }
        });
        if (!classData) throw new Error('Class not found');
        if (classData.students.length > 0) {
            throw new Error(`Cannot delete class. It has ${classData.students.length} students assigned.`);
        }

        await prisma.class.delete({ where: { id } });
    }

    // Get subjects for a class (with active-year teachers)
    static async getSubjectsForClass(classId: number) {
        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                classSubjects: {
                    include: {
                        subject: true,
                        teacherAssignments: {
                            include: {
                                teacher: {
                                    include: {
                                        user: { select: { name: true, email: true } }
                                    }
                                },
                                academicYear: true
                            }
                        }
                    }
                }
            }
        });

        if (!classData) throw new Error('Class not found');

        // FIXED: Properly handle possibly undefined with type safety
        const subjectsWithTeachers = classData.classSubjects.map(cs => {
            // Filter active academic year
            const activeAssignments = cs.teacherAssignments.filter(ta => ta.academicYear.isActive);
            
            // FIX 1: Check if array has elements before accessing [0]
            let teacherInfo = null;
            
            if (activeAssignments.length > 0) {
                const firstAssignment = activeAssignments[0];
                // FIX 2: Check if teacher and user exist
                if (firstAssignment?.teacher?.user) {
                    teacherInfo = {
                        id: firstAssignment.teacher.id,
                        name: firstAssignment.teacher.user.name,
                        employeeId: firstAssignment.teacher.employeeId
                    };
                }
            }
            
            return {
                id: cs.subject.id,
                name: cs.subject.name,
                code: cs.subject.code,
                description: cs.subject.description,
                teacher: teacherInfo
            };
        });

        return {
            class: {
                id: classData.id,
                name: classData.name,
                section: classData.section,
                displayName: `${classData.name} ${classData.section}`
            },
            subjects: subjectsWithTeachers
        };
    }

    // Assign subject to class
    static async assignSubjectToClass(classId: number, subjectId: number) {
        const classExists = await prisma.class.findUnique({ where: { id: classId } });
        if (!classExists) throw new Error('Class not found');

        const subjectExists = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (!subjectExists) throw new Error('Subject not found');

        const existing = await prisma.classSubject.findFirst({
            where: { classId, subjectId }
        });
        if (existing) throw new Error('Subject already assigned to this class');

        return await prisma.classSubject.create({
            data: { classId, subjectId },
            include: { class: true, subject: true }
        });
    }

    // Remove subject from class
    static async removeSubjectFromClass(classId: number, subjectId: number) {
        const assignment = await prisma.classSubject.findFirst({
            where: { classId, subjectId },
            include: { teacherAssignments: true }
        });
        if (!assignment) throw new Error('Subject is not assigned to this class');

        if (assignment.teacherAssignments.length > 0) {
            throw new Error(`Cannot remove subject. It has ${assignment.teacherAssignments.length} teacher(s) assigned.`);
        }

        await prisma.classSubject.delete({ where: { id: assignment.id } });
    }

    // Check if class exists
    static async classExists(id: number): Promise<boolean> {
        const classData = await prisma.class.findUnique({ where: { id } });
        return !!classData;
    }
}

export default ClassService;