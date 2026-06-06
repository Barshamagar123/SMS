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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        }[];
    }[]>;
    static getClassById(id: number): Promise<({
        classSubjects: ({
            subject: {
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                isActive: boolean;
                code: string;
            };
            teacherAssignments: ({
                teacher: {
                    user: {
                        createdAt: Date;
                        updatedAt: Date;
                        id: number;
                        name: string;
                        phone: string | null;
                        isActive: boolean;
                        email: string;
                        password: string;
                        role: import("@prisma/client").$Enums.RoleEnum;
                        status: import("@prisma/client").$Enums.UserStatus;
                        isFirstLogin: boolean;
                        failedAttempts: number;
                        lockedUntil: Date | null;
                        lastLoginAt: Date | null;
                    };
                } & {
                    createdAt: Date;
                    updatedAt: Date | null;
                    id: number;
                    userId: number;
                    address: string | null;
                    phone: string | null;
                    profilePhoto: string | null;
                    isActive: boolean;
                    employeeId: string;
                    qualification: string | null;
                    specialization: string | null;
                    hireDate: Date | null;
                };
                academicYear: {
                    createdAt: Date;
                    id: number;
                    isActive: boolean;
                    year: string;
                    startDate: Date;
                    endDate: Date;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                teacherId: number;
                classSubjectId: number;
                academicYearId: number;
                isPrimary: boolean;
            })[];
        } & {
            createdAt: Date;
            id: number;
            classId: number;
            isActive: boolean;
            subjectId: number;
        })[];
        students: ({
            user: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name: string;
                phone: string | null;
                isActive: boolean;
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.RoleEnum;
                status: import("@prisma/client").$Enums.UserStatus;
                isFirstLogin: boolean;
                failedAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            id: number;
            userId: number;
            rollNumber: string;
            classId: number;
            dateOfBirth: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            bloodGroup: string | null;
            nationality: string | null;
            religion: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            phone: string | null;
            fatherName: string | null;
            motherName: string | null;
            parentPhone: string | null;
            parentEmail: string | null;
            admissionDate: Date;
            previousSchool: string | null;
            previousClass: string | null;
            profilePhoto: string | null;
            isActive: boolean;
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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
    } & {
        createdAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        subjectId: number;
    }>;
    static removeSubjectFromClass(classId: number, subjectId: number): Promise<void>;
    static classExists(id: number): Promise<boolean>;
}
export default ClassService;
