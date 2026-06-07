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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        classId: number;
        teacherId: number;
        subjectId: number;
        title: string;
        passingMarks: number;
        dueDate: Date;
        totalMarks: number;
    }>;
    static getStudentAssignments(studentId: number): Promise<{
        status: string;
        teacher: {
            user: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                name: string;
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
            createdAt: Date;
            updatedAt: Date | null;
            isActive: boolean;
            phone: string | null;
            userId: number;
            address: string | null;
            profilePhoto: string | null;
            employeeId: string;
            qualification: string | null;
            specialization: string | null;
            hireDate: Date | null;
        };
        subject: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            code: string;
        };
        submissions: {
            id: number;
            updatedAt: Date;
            studentId: number;
            marksObtained: number | null;
            grade: string | null;
            assignmentId: number;
            submittedAt: Date;
            comment: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        }[];
        attachments: {
            id: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
            assignmentId: number;
        }[];
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        classId: number;
        teacherId: number;
        subjectId: number;
        title: string;
        passingMarks: number;
        dueDate: Date;
        totalMarks: number;
    }[]>;
    static getAssignmentStatus(assignment: any, submission: any): string;
    static getAssignmentById(assignmentId: number, studentId?: number): Promise<any>;
    static submitAssignment(assignmentId: number, studentId: number, files: Express.Multer.File[], comment?: string): Promise<{
        id: number;
        updatedAt: Date;
        studentId: number;
        marksObtained: number | null;
        grade: string | null;
        assignmentId: number;
        submittedAt: Date;
        comment: string | null;
        feedback: string | null;
        gradedBy: number | null;
        gradedAt: Date | null;
    }>;
    static gradeSubmission(submissionId: number, marksObtained: number, feedback?: string, teacherId?: number): Promise<{
        id: number;
        updatedAt: Date;
        studentId: number;
        marksObtained: number | null;
        grade: string | null;
        assignmentId: number;
        submittedAt: Date;
        comment: string | null;
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
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            code: string;
        };
        submissions: ({
            student: {
                user: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    name: string;
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
                createdAt: Date;
                updatedAt: Date | null;
                isActive: boolean;
                phone: string | null;
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
                fatherName: string | null;
                motherName: string | null;
                parentPhone: string | null;
                parentEmail: string | null;
                admissionDate: Date;
                previousSchool: string | null;
                previousClass: string | null;
                profilePhoto: string | null;
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
            id: number;
            updatedAt: Date;
            studentId: number;
            marksObtained: number | null;
            grade: string | null;
            assignmentId: number;
            submittedAt: Date;
            comment: string | null;
            feedback: string | null;
            gradedBy: number | null;
            gradedAt: Date | null;
        })[];
        attachments: {
            id: number;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedAt: Date;
            assignmentId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        classId: number;
        teacherId: number;
        subjectId: number;
        title: string;
        passingMarks: number;
        dueDate: Date;
        totalMarks: number;
    })[]>;
    static deleteAssignment(assignmentId: number, teacherId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        classId: number;
        teacherId: number;
        subjectId: number;
        title: string;
        passingMarks: number;
        dueDate: Date;
        totalMarks: number;
    }>;
    static updateAssignment(assignmentId: number, teacherId: number, data: {
        title?: string;
        description?: string;
        dueDate?: Date;
        totalMarks?: number;
        passingMarks?: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
        classId: number;
        teacherId: number;
        subjectId: number;
        title: string;
        passingMarks: number;
        dueDate: Date;
        totalMarks: number;
    }>;
}
