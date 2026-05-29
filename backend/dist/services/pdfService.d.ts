export declare class PDFService {
    static generateMonthlyAttendanceReport(className: string, month: number, year: number, students: any[], dailySummary: any, totalDays: number, classPercentage: number): Promise<string>;
    static generateYearlyAttendanceReport(className: string, year: number, students: any[], monthlyData: any[], overallPercentage: number): Promise<string>;
    static generateReportCardPDF(data: {
        studentName: string;
        rollNumber: string;
        className: string;
        examName: string;
        examType: string;
        examDate: Date;
        subject: string;
        maxMarks: number;
        marksObtained: number;
        percentage: number;
        grade: string;
        rank: number;
        totalStudents: number;
        remark: string | null;
    }): Promise<string>;
    static generateBulkReportCardsZip(reportCards: {
        studentId: number;
        rollNumber: string;
        data: any;
    }[], examId: number): Promise<string>;
}
export default PDFService;
