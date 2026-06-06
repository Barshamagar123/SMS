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
        title: string;
        description: string | null;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: number;
        classId: number;
        subjectId: number;
        teacherId: number;
    }>;
    static getStudentAssignments(studentId: number): Promise<{
        status: string;
        subject: {
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            id: number;
            name: string;
            code: string;
        };
        teacher: {
            user: {
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                id: number;
                name: string;
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
            createdAt: Date;
            updatedAt: Date | null;
            isActive: boolean;
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
        title: string;
        description: string | null;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: number;
        classId: number;
        subjectId: number;
        teacherId: number;
    }[]>;
    static getAssignmentStatus(assignment: any, submission: any): string;
    static getAssignmentById(assignmentId: number, studentId?: number): Promise<any>;
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
            isActive: boolean;
            id: number;
            name: string;
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
            attachments: {
                id: number;
                fileName: string;
                fileUrl: string;
                fileSize: number;
                fileType: string;
                uploadedAt: Date;
                submissionId: number;
            }[];
            student: {
                user: {
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    id: number;
                    name: string;
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
                createdAt: Date;
                updatedAt: Date | null;
                isActive: boolean;
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
            };
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
        title: string;
        description: string | null;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: number;
        classId: number;
        subjectId: number;
        teacherId: number;
    })[]>;
    static deleteAssignment(assignmentId: number, teacherId: number): Promise<{
        title: string;
        description: string | null;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: number;
        classId: number;
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
        title: string;
        description: string | null;
        dueDate: Date;
        totalMarks: number;
        passingMarks: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        id: number;
        classId: number;
        subjectId: number;
        teacherId: number;
    }>;
}
