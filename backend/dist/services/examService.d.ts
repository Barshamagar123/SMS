export declare class ExamService {
    static createExamType(data: {
        name: string;
        description?: string;
        weightage?: number;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        name: string;
        description: string | null;
        weightage: number | null;
    }>;
    static getAllExamTypes(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        name: string;
        description: string | null;
        weightage: number | null;
    }[]>;
    static createExam(data: {
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
        name: string;
        examDate: string;
        maxMarks: number;
        passingMarks: number;
        description?: string;
    }): Promise<{
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
        examType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            weightage: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        classId: number;
        academicYearId: number;
        subjectId: number;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    }>;
    static getExamsByClass(classId: number, academicYearId: number): Promise<({
        subject: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            code: string;
        };
        examType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            weightage: number | null;
        };
        results: ({
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
        } & {
            id: number;
            updatedAt: Date;
            examId: number;
            studentId: number;
            marksObtained: import("@prisma/client/runtime/library").Decimal;
            percentage: number | null;
            grade: string | null;
            remark: string | null;
            enteredBy: number;
            enteredAt: Date;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        classId: number;
        academicYearId: number;
        subjectId: number;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    })[]>;
    static getExamsForTeacher(teacherUserId: number, academicYearId: number): Promise<({
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
        examType: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            name: string;
            description: string | null;
            weightage: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        classId: number;
        academicYearId: number;
        subjectId: number;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    })[]>;
    static getStudentsForMarksEntry(examId: number): Promise<{
        studentId: number;
        rollNumber: string;
        studentName: string;
        marksObtained: number | null;
        remark: string | null;
        resultId: number | null;
    }[]>;
    static getGrade(percentage: number): Promise<string>;
    static enterMarks(examId: number, marks: {
        studentId: number;
        marksObtained: number;
        remark?: string;
    }[], enteredBy: number): Promise<{
        id: number;
        updatedAt: Date;
        examId: number;
        studentId: number;
        marksObtained: import("@prisma/client/runtime/library").Decimal;
        percentage: number | null;
        grade: string | null;
        remark: string | null;
        enteredBy: number;
        enteredAt: Date;
    }[]>;
    static getExamResults(examId: number): Promise<{
        exam: {
            id: number;
            name: string;
            examType: string;
            subject: string;
            class: string;
            examDate: Date;
            maxMarks: number;
            passingMarks: number;
            isLocked: boolean;
        };
        analytics: {
            totalStudents: number;
            averageMarks: string | number;
            highestMarks: number;
            lowestMarks: number;
            passCount: number;
            failCount: number;
            passPercentage: string | number;
        };
        results: {
            studentId: number;
            rollNumber: string;
            studentName: string;
            marksObtained: number;
            percentage: number | null;
            grade: string | null;
            remark: string | null;
            rank: number;
        }[];
    }>;
    static lockExam(examId: number, lockedBy: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        classId: number;
        academicYearId: number;
        subjectId: number;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    }>;
    static unlockExam(examId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        classId: number;
        academicYearId: number;
        subjectId: number;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    }>;
    static getStudentExamResults(studentId: number, academicYearId?: number): Promise<{
        examId: number;
        examName: string;
        examType: string;
        subject: string;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        marksObtained: number;
        percentage: number | null;
        grade: string | null;
        remark: string | null;
    }[]>;
    static initializeGradeScales(): Promise<void>;
}
export default ExamService;
