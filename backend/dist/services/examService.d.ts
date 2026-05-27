export declare class ExamService {
    static createExamType(data: {
        name: string;
        description?: string;
        weightage?: number;
    }): Promise<{
        name: string;
        description: string | null;
        weightage: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    static getAllExamTypes(): Promise<{
        name: string;
        description: string | null;
        weightage: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
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
        examType: {
            name: string;
            description: string | null;
            weightage: number | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        };
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
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
    }>;
    static getExamsByClass(classId: number, academicYearId: number): Promise<({
        examType: {
            name: string;
            description: string | null;
            weightage: number | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
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
        results: ({
            student: {
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
            };
        } & {
            updatedAt: Date;
            id: number;
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
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
    })[]>;
    static getExamsForTeacher(teacherUserId: number, academicYearId: number): Promise<({
        examType: {
            name: string;
            description: string | null;
            weightage: number | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        };
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
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
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
        updatedAt: Date;
        id: number;
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
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
    }>;
    static unlockExam(examId: number): Promise<{
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        examDate: Date;
        maxMarks: number;
        passingMarks: number;
        isLocked: boolean;
        lockedAt: Date | null;
        lockedBy: number | null;
        examTypeId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
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
