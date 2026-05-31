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
        id: number;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        createdAt: Date;
        updatedAt: Date;
        classId: number;
        studentId: number;
        date: Date;
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
        holidays: {
            date: string | undefined;
            name: string;
        }[];
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
    static isHoliday(date: Date): Promise<{
        isHoliday: boolean;
        holidayName?: string;
    }>;
    static getAllHolidays(year?: number, month?: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        date: Date;
    }[]>;
    static addHoliday(name: string, date: string, description?: string): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        date: Date;
    }>;
    static deleteHoliday(id: number): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdAt: Date;
        description: string | null;
        date: Date;
    }>;
    static getMonthlyReportWithHolidays(classId: number, month: number, year: number): Promise<{
        className: string;
        month: number;
        year: number;
        totalStudents: number;
        totalWorkingDays: number;
        totalHolidays: number;
        holidays: {
            date: string | undefined;
            name: string;
            description: string | null;
        }[];
        classPercentage: number;
        students: {
            id: number;
            rollNumber: string;
            name: string;
            totalDays: number;
            presentDays: number;
            absentDays: number;
            percentage: number;
        }[];
    }>;
    static getMonthlyDetailedReport(classId: number, month: number, year: number): Promise<{
        className: string;
        month: number;
        year: number;
        totalStudents: number;
        totalWorkingDays: number;
        totalHolidays: number;
        holidays: {
            date: string | undefined;
            name: string;
            description: string | null;
        }[];
        classPercentage: number;
        students: {
            id: number;
            rollNumber: string;
            name: string;
            totalDays: number;
            presentDays: number;
            absentDays: number;
            percentage: number;
        }[];
    }>;
    static getYearlyDetailedReport(classId: number, year: number): Promise<{
        className: string;
        year: number;
        totalStudents: number;
        totalWorkingDays: number;
        totalHolidays: number;
        holidays: {
            date: string | undefined;
            name: string;
        }[];
        overallPercentage: number;
        monthlyData: {
            month: number;
            totalDays: number;
            presentDays: number;
            percentage: number;
        }[];
        students: {
            id: number;
            rollNumber: string;
            name: string;
            totalDays: number;
            presentDays: number;
            absentDays: number;
            percentage: number;
        }[];
    }>;
}
export default AttendanceService;
