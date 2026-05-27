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
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            code: string;
        }[];
    }[]>;
    static getClassById(id: number): Promise<({
        students: ({
            user: {
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                phone: string | null;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date | null;
            id: number;
            classId: number;
            rollNumber: string;
            userId: number;
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
        })[];
        classSubjects: ({
            subject: {
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                code: string;
            };
            teacherAssignments: ({
                academicYear: {
                    isActive: boolean;
                    createdAt: Date;
                    id: number;
                    year: string;
                    startDate: Date;
                    endDate: Date;
                };
                teacher: {
                    user: {
                        name: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        id: number;
                        phone: string | null;
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
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date | null;
                    id: number;
                    userId: number;
                    address: string | null;
                    phone: string | null;
                    profilePhoto: string | null;
                    employeeId: string;
                    qualification: string | null;
                    specialization: string | null;
                    hireDate: Date | null;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                academicYearId: number;
                teacherId: number;
                classSubjectId: number;
                isPrimary: boolean;
            })[];
        } & {
            isActive: boolean;
            createdAt: Date;
            id: number;
            classId: number;
            subjectId: number;
        })[];
    } & {
        name: string;
        id: number;
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
            name: string;
            id: number;
            section: string;
        };
        subject: {
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            code: string;
        };
    } & {
        isActive: boolean;
        createdAt: Date;
        id: number;
        classId: number;
        subjectId: number;
    }>;
    static removeSubjectFromClass(classId: number, subjectId: number): Promise<void>;
    static classExists(id: number): Promise<boolean>;
}
export default ClassService;
