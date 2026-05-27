import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFService {

  // Generate Monthly Attendance Report
  static async generateMonthlyAttendanceReport(
    className: string,
    month: number,
    year: number,
    students: any[],
    dailySummary: any,
    totalDays: number,
    classPercentage: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Fix: Ensure month is within valid range
        const validMonth = Math.min(Math.max(month, 1), 12);
        const monthName = monthNames[validMonth - 1] || 'Unknown';
        
        // Sanitize className for filename
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

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica').text(`Class: ${className}`, { align: 'center' });
        doc.fontSize(14).text(`Month: ${monthName} ${year}`, { align: 'center' });
        doc.moveDown();

        // Summary Box
        doc.rect(50, doc.y, 495, 80).stroke();
        doc.fontSize(12).font('Helvetica-Bold').text('Summary', 60, doc.y + 10);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total Students: ${students.length}`, 60, doc.y + 30);
        doc.text(`Total Working Days: ${totalDays}`, 60, doc.y + 45);
        doc.text(`Overall Class Attendance: ${classPercentage}%`, 60, doc.y + 60);
        doc.moveDown(2);

        // Individual Student Table
        if (students.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Individual Student Attendance', { align: 'center' });
          doc.moveDown(0.5);

          // Table Headers
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
              // Re-draw headers on new page
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

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica');
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 50, doc.y, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate Yearly Attendance Report
  static async generateYearlyAttendanceReport(
    className: string,
    year: number,
    students: any[],
    monthlyData: any[],
    overallPercentage: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Sanitize className for filename
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

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Yearly Attendance Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica').text(`Class: ${className}`, { align: 'center' });
        doc.fontSize(14).text(`Year: ${year}`, { align: 'center' });
        doc.moveDown();

        // Summary
        doc.rect(50, doc.y, 495, 60).stroke();
        doc.fontSize(12).font('Helvetica-Bold').text('Yearly Summary', 60, doc.y + 10);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total Students: ${students.length}`, 60, doc.y + 30);
        doc.text(`Overall Yearly Attendance: ${overallPercentage}%`, 60, doc.y + 45);
        doc.moveDown(2);

        // Monthly Breakdown Table
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

        // Individual Student Summary
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

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica');
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 50, doc.y, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }
}

export default PDFService;