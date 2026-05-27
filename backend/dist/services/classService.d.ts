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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
        }[];
    }[]>;
    static getClassById(id: number): Promise<({
        students: ({
            user: {
                id: number;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                password: string;
                name: string;
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
            createdAt: Date;
            updatedAt: Date | null;
        })[];
        classSubjects: ({
            teacherAssignments: ({
                teacher: {
                    user: {
                        id: number;
                        phone: string | null;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        email: string;
                        password: string;
                        name: string;
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
                    address: string | null;
                    phone: string | null;
                    profilePhoto: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date | null;
                    employeeId: string;
                    qualification: string | null;
                    specialization: string | null;
                    hireDate: Date | null;
                };
                academicYear: {
                    id: number;
                    isActive: boolean;
                    createdAt: Date;
                    year: string;
                    startDate: Date;
                    endDate: Date;
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
            subject: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                code: string;
            };
        } & {
            id: number;
            classId: number;
            isActive: boolean;
            createdAt: Date;
            subjectId: number;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            code: string;
        };
    } & {
        id: number;
        classId: number;
        isActive: boolean;
        createdAt: Date;
        subjectId: number;
    }>;
    static removeSubjectFromClass(classId: number, subjectId: number): Promise<void>;
    static classExists(id: number): Promise<boolean>;
}
export default ClassService;
