export declare class PDFService {
    static generateMonthlyAttendanceReport(className: string, month: number, year: number, students: any[], dailySummary: any, totalDays: number, classPercentage: number): Promise<string>;
    static generateYearlyAttendanceReport(className: string, year: number, students: any[], monthlyData: any[], overallPercentage: number): Promise<string>;
}
export default PDFService;
