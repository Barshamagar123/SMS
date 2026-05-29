import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class PDFService {
    // ================= ATTENDANCE REPORTS =================
    static async generateMonthlyAttendanceReport(className, month, year, students, dailySummary, totalDays, classPercentage) {
        return new Promise((resolve, reject) => {
            try {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                const validMonth = Math.min(Math.max(month, 1), 12);
                const monthName = monthNames[validMonth - 1] || 'Unknown';
                const safeClassName = className.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                const fileName = `attendance_${safeClassName}_${monthName}_${year}.pdf`;
                const filePath = path.join(__dirname, '../../reports', fileName);
                const reportsDir = path.join(__dirname, '../../reports');
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica').text(`Class: ${className}`, { align: 'center' });
                doc.fontSize(14).text(`Month: ${monthName} ${year}`, { align: 'center' });
                doc.moveDown();
                doc.rect(50, doc.y, 495, 80).stroke();
                doc.fontSize(12).font('Helvetica-Bold').text('Summary', 60, doc.y + 10);
                doc.fontSize(10).font('Helvetica');
                doc.text(`Total Students: ${students.length}`, 60, doc.y + 30);
                doc.text(`Total Working Days: ${totalDays}`, 60, doc.y + 45);
                doc.text(`Overall Class Attendance: ${classPercentage}%`, 60, doc.y + 60);
                doc.moveDown(2);
                if (students.length > 0) {
                    doc.fontSize(12).font('Helvetica-Bold').text('Individual Student Attendance', { align: 'center' });
                    doc.moveDown(0.5);
                    const tableTop = doc.y;
                    const col1 = 50;
                    const col2 = 150;
                    const col3 = 280;
                    const col4 = 380;
                    const col5 = 480;
                    doc.fontSize(9).font('Helvetica-Bold');
                    doc.text('Roll No', col1, tableTop);
                    doc.text('Student Name', col2, tableTop);
                    doc.text('Present', col3, tableTop);
                    doc.text('Absent', col4, tableTop);
                    doc.text('Percentage', col5, tableTop);
                    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
                    doc.moveDown();
                    let rowTop = tableTop + 20;
                    doc.fontSize(9).font('Helvetica');
                    for (const student of students) {
                        if (rowTop > 750) {
                            doc.addPage();
                            rowTop = 50;
                            doc.fontSize(9).font('Helvetica-Bold');
                            doc.text('Roll No', col1, rowTop);
                            doc.text('Student Name', col2, rowTop);
                            doc.text('Present', col3, rowTop);
                            doc.text('Absent', col4, rowTop);
                            doc.text('Percentage', col5, rowTop);
                            doc.moveTo(50, rowTop + 15).lineTo(545, rowTop + 15).stroke();
                            rowTop += 20;
                            doc.fontSize(9).font('Helvetica');
                        }
                        doc.text(student.rollNumber || '-', col1, rowTop);
                        doc.text((student.name || '-').substring(0, 25), col2, rowTop);
                        doc.text((student.presentDays || 0).toString(), col3, rowTop);
                        doc.text((student.absentDays || 0).toString(), col4, rowTop);
                        doc.text(`${student.percentage || 0}%`, col5, rowTop);
                        rowTop += 20;
                    }
                }
                doc.moveDown(2);
                doc.fontSize(8).font('Helvetica');
                doc.text(`Report Generated: ${new Date().toLocaleString()}`, 50, doc.y, { align: 'center' });
                doc.end();
                writeStream.on('finish', () => resolve(filePath));
                writeStream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    static async generateYearlyAttendanceReport(className, year, students, monthlyData, overallPercentage) {
        return new Promise((resolve, reject) => {
            try {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                const safeClassName = className.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                const fileName = `attendance_${safeClassName}_YEAR_${year}.pdf`;
                const filePath = path.join(__dirname, '../../reports', fileName);
                const reportsDir = path.join(__dirname, '../../reports');
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                doc.fontSize(20).font('Helvetica-Bold').text('Yearly Attendance Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica').text(`Class: ${className}`, { align: 'center' });
                doc.fontSize(14).text(`Year: ${year}`, { align: 'center' });
                doc.moveDown();
                doc.rect(50, doc.y, 495, 60).stroke();
                doc.fontSize(12).font('Helvetica-Bold').text('Yearly Summary', 60, doc.y + 10);
                doc.fontSize(10).font('Helvetica');
                doc.text(`Total Students: ${students.length}`, 60, doc.y + 30);
                doc.text(`Overall Yearly Attendance: ${overallPercentage}%`, 60, doc.y + 45);
                doc.moveDown(2);
                if (monthlyData.length > 0) {
                    doc.fontSize(12).font('Helvetica-Bold').text('Monthly Breakdown', { align: 'center' });
                    doc.moveDown(0.5);
                    let tableTop = doc.y;
                    const col1 = 50;
                    const col2 = 180;
                    const col3 = 310;
                    const col4 = 440;
                    doc.fontSize(9).font('Helvetica-Bold');
                    doc.text('Month', col1, tableTop);
                    doc.text('Total Days', col2, tableTop);
                    doc.text('Present Days', col3, tableTop);
                    doc.text('Percentage', col4, tableTop);
                    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
                    doc.moveDown();
                    let rowTop = tableTop + 20;
                    doc.fontSize(9).font('Helvetica');
                    for (const month of monthlyData) {
                        if (rowTop > 750) {
                            doc.addPage();
                            rowTop = 50;
                            doc.fontSize(9).font('Helvetica-Bold');
                            doc.text('Month', col1, rowTop);
                            doc.text('Total Days', col2, rowTop);
                            doc.text('Present Days', col3, rowTop);
                            doc.text('Percentage', col4, rowTop);
                            doc.moveTo(50, rowTop + 15).lineTo(545, rowTop + 15).stroke();
                            rowTop += 20;
                            doc.fontSize(9).font('Helvetica');
                        }
                        const monthName = monthNames[(month.month - 1)] || 'Unknown';
                        doc.text(monthName, col1, rowTop);
                        doc.text((month.totalDays || 0).toString(), col2, rowTop);
                        doc.text((month.presentDays || 0).toString(), col3, rowTop);
                        doc.text(`${month.percentage || 0}%`, col4, rowTop);
                        rowTop += 20;
                    }
                }
                if (students.length > 0) {
                    doc.addPage();
                    doc.fontSize(12).font('Helvetica-Bold').text('Individual Student Yearly Summary', { align: 'center' });
                    doc.moveDown(0.5);
                    let tableTop = doc.y;
                    const col1 = 50;
                    const col2 = 150;
                    const col3 = 280;
                    const col4 = 380;
                    const col5 = 480;
                    doc.fontSize(9).font('Helvetica-Bold');
                    doc.text('Roll No', col1, tableTop);
                    doc.text('Student Name', col2, tableTop);
                    doc.text('Present', col3, tableTop);
                    doc.text('Absent', col4, tableTop);
                    doc.text('Percentage', col5, tableTop);
                    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
                    doc.moveDown();
                    let rowTop = tableTop + 20;
                    doc.fontSize(9).font('Helvetica');
                    for (const student of students) {
                        if (rowTop > 750) {
                            doc.addPage();
                            rowTop = 50;
                            doc.fontSize(9).font('Helvetica-Bold');
                            doc.text('Roll No', col1, rowTop);
                            doc.text('Student Name', col2, rowTop);
                            doc.text('Present', col3, rowTop);
                            doc.text('Absent', col4, rowTop);
                            doc.text('Percentage', col5, rowTop);
                            doc.moveTo(50, rowTop + 15).lineTo(545, rowTop + 15).stroke();
                            rowTop += 20;
                            doc.fontSize(9).font('Helvetica');
                        }
                        doc.text(student.rollNumber || '-', col1, rowTop);
                        doc.text((student.name || '-').substring(0, 25), col2, rowTop);
                        doc.text((student.presentDays || 0).toString(), col3, rowTop);
                        doc.text((student.absentDays || 0).toString(), col4, rowTop);
                        doc.text(`${student.percentage || 0}%`, col5, rowTop);
                        rowTop += 20;
                    }
                }
                doc.moveDown(2);
                doc.fontSize(8).font('Helvetica');
                doc.text(`Report Generated: ${new Date().toLocaleString()}`, 50, doc.y, { align: 'center' });
                doc.end();
                writeStream.on('finish', () => resolve(filePath));
                writeStream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // ================= REPORT CARD GENERATION =================
    static async generateReportCardPDF(data) {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `report_card_${data.rollNumber}_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../../reports', fileName);
                const reportsDir = path.join(__dirname, '../../reports');
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                // School Header
                doc.fontSize(22).font('Helvetica-Bold').text('EduManage School', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica').text('Progress Report Card', { align: 'center' });
                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown();
                // Student Information
                doc.fontSize(12).font('Helvetica-Bold').text('STUDENT INFORMATION', { underline: true });
                doc.moveDown(0.5);
                const infoY = doc.y;
                doc.fontSize(10).font('Helvetica-Bold').text('Student Name: ', 50, infoY);
                doc.font('Helvetica').text(data.studentName, 150, infoY);
                doc.font('Helvetica-Bold').text('Roll Number: ', 300, infoY);
                doc.font('Helvetica').text(data.rollNumber, 400, infoY);
                doc.font('Helvetica-Bold').text('Class: ', 50, infoY + 20);
                doc.font('Helvetica').text(data.className, 150, infoY + 20);
                doc.font('Helvetica-Bold').text('Exam: ', 300, infoY + 20);
                doc.font('Helvetica').text(data.examName, 400, infoY + 20);
                doc.font('Helvetica-Bold').text('Exam Type: ', 50, infoY + 40);
                doc.font('Helvetica').text(data.examType, 150, infoY + 40);
                doc.font('Helvetica-Bold').text('Exam Date: ', 300, infoY + 40);
                doc.font('Helvetica').text(data.examDate.toLocaleDateString(), 400, infoY + 40);
                doc.moveDown(2);
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown();
                // Marks Section
                doc.fontSize(12).font('Helvetica-Bold').text('MARKS SUMMARY', { underline: true });
                doc.moveDown(0.5);
                const tableTop = doc.y;
                const col1 = 50;
                const col2 = 200;
                const col3 = 300;
                const col4 = 400;
                const col5 = 480;
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Subject', col1, tableTop);
                doc.text('Max Marks', col2, tableTop);
                doc.text('Obtained', col3, tableTop);
                doc.text('Percentage', col4, tableTop);
                doc.text('Grade', col5, tableTop);
                doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();
                doc.moveDown();
                doc.fontSize(10).font('Helvetica');
                doc.text(data.subject, 50, tableTop + 20);
                doc.text(data.maxMarks.toString(), 200, tableTop + 20);
                doc.text(data.marksObtained.toString(), 300, tableTop + 20);
                doc.text(`${data.percentage.toFixed(2)}%`, 400, tableTop + 20);
                doc.text(data.grade, 480, tableTop + 20);
                doc.moveTo(50, tableTop + 40).lineTo(545, tableTop + 40).stroke();
                doc.moveDown();
                // Summary
                doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).font('Helvetica-Bold').text('Total Percentage: ', 50, doc.y);
                doc.font('Helvetica').text(`${data.percentage.toFixed(2)}%`, 180, doc.y);
                doc.moveDown();
                doc.fontSize(10).font('Helvetica-Bold').text('Grade Obtained: ', 50, doc.y);
                doc.font('Helvetica').text(data.grade, 180, doc.y);
                doc.moveDown();
                doc.fontSize(10).font('Helvetica-Bold').text('Class Rank: ', 50, doc.y);
                doc.font('Helvetica').text(`${data.rank} out of ${data.totalStudents}`, 180, doc.y);
                doc.moveDown();
                if (data.remark) {
                    doc.fontSize(10).font('Helvetica-Bold').text('Teacher\'s Remarks: ', 50, doc.y);
                    doc.font('Helvetica').text(data.remark, 180, doc.y);
                    doc.moveDown();
                }
                // Footer
                doc.moveDown(2);
                doc.fontSize(8).font('Helvetica');
                doc.text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'center' });
                doc.text('This is a system generated report card.', { align: 'center' });
                doc.end();
                writeStream.on('finish', () => resolve(filePath));
                writeStream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // Generate Bulk Report Cards as ZIP
    static async generateBulkReportCardsZip(reportCards, examId) {
        return new Promise(async (resolve, reject) => {
            try {
                const reportsDir = path.join(__dirname, '../../reports');
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }
                const zipFileName = `report_cards_exam_${examId}_${Date.now()}.zip`;
                const zipFilePath = path.join(reportsDir, zipFileName);
                const output = fs.createWriteStream(zipFilePath);
                // Use dynamic import for archiver to avoid ES6 issues
                const archiverModule = await import('archiver');
                const archive = archiverModule.default('zip', { zlib: { level: 9 } });
                output.on('close', () => resolve(zipFilePath));
                archive.on('error', reject);
                archive.pipe(output);
                for (const card of reportCards) {
                    const pdfPath = await this.generateReportCardPDF(card.data);
                    archive.file(pdfPath, { name: `report_card_${card.rollNumber}.pdf` });
                }
                await archive.finalize();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
export default PDFService;
//# sourceMappingURL=pdfService.js.map