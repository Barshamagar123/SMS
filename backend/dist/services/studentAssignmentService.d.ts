export declare class StudentAssignmentService {
    static createAssignment(data: {
        title: string;
        description?: string;
        classId: number;
        subjectId: number;
        teacherId: number;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        files?: Express.Multer.File[];
    }): Promise<{
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }>;
    static getStudentAssignments(studentId: number): Promise<{
        status: string;
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
        subject: {
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
        attachments: {
            id: number;
            assignmentId: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
        }[];
        submissions: {
            updatedAt: Date;
            id: number;
            assignmentId: number;
            studentId: number;
            submittedAt: Date;
            comment: string | null;
            marksObtained: number | null;
            grade: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        }[];
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }[]>;
    static getAssignmentStatus(assignment: any, submission: any): string;
    static getAssignmentById(assignmentId: number, studentId?: number): Promise<({
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
        subject: {
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
        attachments: {
            id: number;
            assignmentId: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
        }[];
        submissions: {
            updatedAt: Date;
            id: number;
            assignmentId: number;
            studentId: number;
            submittedAt: Date;
            comment: string | null;
            marksObtained: number | null;
            grade: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        }[];
    } & {
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }) | {
        status: string;
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
        subject: {
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            isActive: boolean;
            code: string;
        };
        attachments: {
            id: number;
            assignmentId: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
        }[];
        submissions: {
            updatedAt: Date;
            id: number;
            assignmentId: number;
            studentId: number;
            submittedAt: Date;
            comment: string | null;
            marksObtained: number | null;
            grade: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        }[];
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }>;
    static submitAssignment(assignmentId: number, studentId: number, files: Express.Multer.File[], comment?: string): Promise<{
        updatedAt: Date;
        id: number;
        assignmentId: number;
        studentId: number;
        submittedAt: Date;
        comment: string | null;
        marksObtained: number | null;
        grade: string | null;
        feedback: string | null;
        gradedBy: number | null;
        gradedAt: Date | null;
    }>;
    static gradeSubmission(submissionId: number, marksObtained: number, feedback?: string, teacherId?: number): Promise<{
        updatedAt: Date;
        id: number;
        assignmentId: number;
        studentId: number;
        submittedAt: Date;
        comment: string | null;
        marksObtained: number | null;
        grade: string | null;
        feedback: string | null;
        gradedBy: number | null;
        gradedAt: Date | null;
    }>;
    static calculateGrade(marks: number, total: number): string;
    static getTeacherAssignments(teacherId: number): Promise<({
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
        attachments: {
            id: number;
            assignmentId: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
        }[];
        submissions: ({
            student: {
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
            };
            attachments: {
                id: number;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                fileType: string;
                uploadedAt: Date;
                submissionId: number;
            }[];
        } & {
            updatedAt: Date;
            id: number;
            assignmentId: number;
            studentId: number;
            submittedAt: Date;
            comment: string | null;
            marksObtained: number | null;
            grade: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        })[];
    } & {
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    })[]>;
    static deleteAssignment(assignmentId: number, teacherId: number): Promise<{
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }>;
    static updateAssignment(assignmentId: number, teacherId: number, data: {
        title?: string;
        description?: string;
        dueDate?: Date;
        totalMarks?: number;
        passingMarks?: number;
    }): Promise<{
        description: string | null;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        classId: number;
        isActive: boolean;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        subjectId: number;
        teacherId: number;
    }>;
}
