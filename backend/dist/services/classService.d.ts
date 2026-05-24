import { Class } from '@prisma/client';
export declare class ClassService {
    static createClass(data: {
        name: string;
        section: string;
    }): Promise<Class>;
    static getAllClasses(): Promise<{
        id: number;
        name: string;
        section: string;
        displayName: string;
        studentCount: number;
        subjectCount: number;
        subjects: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
            description: string | null;
            updatedAt: Date;
        }[];
    }[]>;
    static getClassById(id: number): Promise<({
        students: ({
            user: {
                id: number;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                password: string;
                phone: string | null;
                role: import("@prisma/client").$Enums.RoleEnum;
                status: import("@prisma/client").$Enums.UserStatus;
                isFirstLogin: boolean;
                failedAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
            };
        } & {
            id: number;
            rollNumber: string;
            userId: number;
            classId: number;
        })[];
        classSubjects: ({
            subject: {
                id: number;
                name: string;
                isActive: boolean;
                createdAt: Date;
                code: string;
                description: string | null;
                updatedAt: Date;
            };
            teacherAssignments: ({
                academicYear: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    year: string;
                    startDate: Date;
                    endDate: Date;
                };
                teacher: {
                    user: {
                        id: number;
                        name: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        email: string;
                        password: string;
                        phone: string | null;
                        role: import("@prisma/client").$Enums.RoleEnum;
                        status: import("@prisma/client").$Enums.UserStatus;
                        isFirstLogin: boolean;
                        failedAttempts: number;
                        lockedUntil: Date | null;
                        lastLoginAt: Date | null;
                    };
                } & {
                    id: number;
                    userId: number;
                    employeeId: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                teacherId: number;
                classSubjectId: number;
                academicYearId: number;
                isPrimary: boolean;
            })[];
        } & {
            id: number;
            classId: number;
            subjectId: number;
            isActive: boolean;
            createdAt: Date;
        })[];
    } & {
        id: number;
        name: string;
        section: string;
    }) | null>;
    static updateClass(id: number, data: {
        name?: string;
        section?: string;
    }): Promise<Class>;
    static deleteClass(id: number): Promise<void>;
    static getSubjectsForClass(classId: number): Promise<{
        class: {
            id: number;
            name: string;
            section: string;
            displayName: string;
        };
        subjects: {
            id: number;
            name: string;
            code: string;
            description: string | null;
            teacher: {
                id: number;
                name: string;
                employeeId: string;
            } | null;
        }[];
    }>;
    static assignSubjectToClass(classId: number, subjectId: number): Promise<{
        class: {
            id: number;
            name: string;
            section: string;
        };
        subject: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
            description: string | null;
            updatedAt: Date;
        };
    } & {
        id: number;
        classId: number;
        subjectId: number;
        isActive: boolean;
        createdAt: Date;
    }>;
    static removeSubjectFromClass(classId: number, subjectId: number): Promise<void>;
    static classExists(id: number): Promise<boolean>;
}
export default ClassService;
