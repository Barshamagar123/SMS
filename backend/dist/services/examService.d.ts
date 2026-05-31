export declare class ExamService {
    static createExamType(data: {
        name: string;
        description?: string;
        weightage?: number;
    }): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        weightage: number | null;
    }>;
    static getAllExamTypes(): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        examType: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            weightage: number | null;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: number;
        classId: number;
        subjectId: number;
        description: string | null;
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
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            description: string | null;
        };
        examType: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            weightage: number | null;
        };
        results: ({
            student: {
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
            };
        } & {
            id: number;
            updatedAt: Date;
            studentId: number;
            remark: string | null;
            examId: number;
            marksObtained: import("@prisma/client/runtime/library").Decimal;
            percentage: number | null;
            grade: string | null;
            enteredBy: number;
            enteredAt: Date;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: number;
        classId: number;
        subjectId: number;
        description: string | null;
        examTypeId: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
    })[]>;
    static getExamsForTeacher(teacherUserId: number, academicYearId: number): Promise<({
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
        examType: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            weightage: number | null;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: number;
        classId: number;
        subjectId: number;
        description: string | null;
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
        studentId: number;
        remark: string | null;
        examId: number;
        marksObtained: import("@prisma/client/runtime/library").Decimal;
        percentage: number | null;
        grade: string | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: number;
        classId: number;
        subjectId: number;
        description: string | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        academicYearId: number;
        classId: number;
        subjectId: number;
        description: string | null;
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
