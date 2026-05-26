import { AttendanceStatus } from '@prisma/client';
interface DailySummary {
    total: number;
    present: number;
    absent: number;
}
interface MonthlyBreakdownItem {
    year: number;
    month: number;
    totalDays: number;
    presentDays: number;
    percentage: number;
}
export declare class AttendanceService {
    static getStudentsByClass(classId: number, date?: string): Promise<{
        id: number;
        rollNumber: string;
        name: string;
        status: import("@prisma/client").$Enums.AttendanceStatus | null;
        remark: string | null;
        attendanceId: number | null;
    }[]>;
    static markAttendance(classId: number, date: string, attendances: {
        studentId: number;
        status: AttendanceStatus;
        remark?: string;
    }[], markedBy: number): Promise<{
        classId: number;
        date: Date;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        studentId: number;
        remark: string | null;
        markedBy: number;
    }[]>;
    static getTeacherClasses(teacherUserId: number): Promise<{
        id: number;
        name: string;
        section: string;
        displayName: string;
    }[]>;
    static getAttendanceByClass(classId: number, month?: number, year?: number): Promise<{
        classId: number;
        month: number;
        year: number;
        classPercentage: number;
        dailySummary: Record<string, DailySummary>;
        totalRecords: number;
    }>;
    static getStudentAttendance(studentId: number): Promise<{
        summary: {
            totalDays: number;
            presentDays: number;
            absentDays: number;
            percentage: number;
        };
        monthlyBreakdown: MonthlyBreakdownItem[];
        recentAttendance: {
            date: string | undefined;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            remark: string | null;
        }[];
        alert: {
            show: boolean;
            message: string;
        } | null;
    }>;
    static deleteAttendance(attendanceId: number, teacherId: number): Promise<{
        success: boolean;
    }>;
}
export default AttendanceService;
