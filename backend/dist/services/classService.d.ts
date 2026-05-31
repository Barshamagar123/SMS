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
            updatedAt: Date;
            code: string;
            description: string | null;
        }[];
    }[]>;
    static getClassById(id: number): Promise<({
        students: ({
            user: {
                id: number;
                email: string;
                password: string;
                name: string;
                phone: string | null;
                role: import("@prisma/client").$Enums.RoleEnum;
                status: import("@prisma/client").$Enums.UserStatus;
                isActive: boolean;
                isFirstLogin: boolean;
                failedAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date | null;
            userId: number;
            profilePhoto: string | null;
            address: string | null;
            classId: number;
            rollNumber: string;
            dateOfBirth: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            bloodGroup: string | null;
            nationality: string | null;
            religion: string | null;
            city: string | null;
            state: string | null;
            fatherName: string | null;
            motherName: string | null;
            parentPhone: string | null;
            parentEmail: string | null;
            admissionDate: Date;
            previousSchool: string | null;
            previousClass: string | null;
        })[];
        classSubjects: ({
            subject: {
                id: number;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                description: string | null;
            };
            teacherAssignments: ({
                teacher: {
                    user: {
                        id: number;
                        email: string;
                        password: string;
                        name: string;
                        phone: string | null;
                        role: import("@prisma/client").$Enums.RoleEnum;
                        status: import("@prisma/client").$Enums.UserStatus;
                        isActive: boolean;
                        isFirstLogin: boolean;
                        failedAttempts: number;
                        lockedUntil: Date | null;
                        lastLoginAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: number;
                    phone: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date | null;
                    userId: number;
                    employeeId: string;
                    profilePhoto: string | null;
                    qualification: string | null;
                    specialization: string | null;
                    address: string | null;
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
        } & {
            id: number;
            isActive: boolean;
            createdAt: Date;
            classId: number;
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
        subject: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
        };
        class: {
            id: number;
            name: string;
            section: string;
        };
    } & {
        id: number;
        isActive: boolean;
        createdAt: Date;
        classId: number;
        subjectId: number;
    }>;
    static removeSubjectFromClass(classId: number, subjectId: number): Promise<void>;
    static classExists(id: number): Promise<boolean>;
}
export default ClassService;
