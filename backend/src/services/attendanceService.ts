import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define interface for daily summary
interface DailySummary {
  total: number;
  present: number;
  absent: number;
}

// Define interface for monthly breakdown
interface MonthlyBreakdownItem {
  year: number;
  month: number;
  totalDays: number;
  presentDays: number;
  percentage: number;
}

export class AttendanceService {

  // Get students by class for marking attendance
  static async getStudentsByClass(classId: number, date?: string) {
    // Check if date is holiday
    if (date) {
      const holidayInfo = await this.isHoliday(new Date(date));
      if (holidayInfo.isHoliday) {
        throw new Error(`Cannot mark attendance on ${date}. It is a holiday: ${holidayInfo.holidayName}`);
      }
    }

    const students = await prisma.student.findMany({
      where: {
        classId,
        isActive: true,
        user: { isActive: true }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        rollNumber: 'asc'
      }
    });

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const existingAttendance = await prisma.attendance.findMany({
        where: {
          classId,
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      return students.map(student => {
        const existing = existingAttendance.find(a => a.studentId === student.id);
        return {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.user.name,
          status: existing?.status || null,
          remark: existing?.remark || null,
          attendanceId: existing?.id || null
        };
      });
    }

    return students.map(student => ({
      id: student.id,
      rollNumber: student.rollNumber,
      name: student.user.name,
      status: null,
      remark: null,
      attendanceId: null
    }));
  }

  // Mark attendance
  static async markAttendance(
    classId: number,
    date: string,
    attendances: { studentId: number; status: AttendanceStatus; remark?: string }[],
    markedBy: number
  ) {
    // Check if date is holiday
    const holidayInfo = await this.isHoliday(new Date(date));
    if (holidayInfo.isHoliday) {
      throw new Error(`Cannot mark attendance on ${date}. It is a holiday: ${holidayInfo.holidayName}`);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    for (const att of attendances) {
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: att.studentId,
          date: attendanceDate
        }
      });

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: att.status,
            remark: att.remark || null,
            markedBy
          }
        });
        results.push(updated);
      } else {
        const created = await prisma.attendance.create({
          data: {
            studentId: att.studentId,
            classId,
            date: attendanceDate,
            status: att.status,
            remark: att.remark || null,
            markedBy
          }
        });
        results.push(created);
      }
    }

    return results;
  }

  // Get teacher's classes
  static async getTeacherClasses(teacherUserId: number) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: teacherUserId }
    });

    if (!teacher) return [];

    const assignments = await prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        classSubject: {
          include: {
            class: true
          }
        }
      }
    });

    const uniqueClasses: { id: number; name: string; section: string; displayName: string }[] = [];
    const seenIds = new Set<number>();

    for (const assignment of assignments) {
      const classId = assignment.classSubject.class.id;
      if (!seenIds.has(classId)) {
        seenIds.add(classId);
        uniqueClasses.push({
          id: classId,
          name: assignment.classSubject.class.name,
          section: assignment.classSubject.class.section,
          displayName: `${assignment.classSubject.class.name} ${assignment.classSubject.class.section}`
        });
      }
    }

    return uniqueClasses;
  }

  // Get class attendance report
  static async getAttendanceByClass(classId: number, month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(currentYear, currentMonth, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get holidays in this month
    const holidays = await prisma.holiday.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });
    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

    const attendances = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const dailySummary: Record<string, DailySummary> = {};

    for (const att of attendances) {
      const dateStr = att.date.toISOString().split('T')[0];
      // Skip holidays in summary
      if (dateStr && !holidayDates.has(dateStr)) {
        if (!dailySummary[dateStr]) {
          dailySummary[dateStr] = { total: 0, present: 0, absent: 0 };
        }
        dailySummary[dateStr].total++;
        if (att.status === 'PRESENT') {
          dailySummary[dateStr].present++;
        } else {
          dailySummary[dateStr].absent++;
        }
      }
    }

    const totalPresent = attendances.filter(a => a.status === 'PRESENT').length;
    const totalRecords = attendances.length;
    const classPercentage = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      classId,
      month: currentMonth,
      year: currentYear,
      classPercentage: Number(classPercentage.toFixed(2)),
      dailySummary,
      totalRecords,
      holidays: holidays.map(h => ({
        date: h.date.toISOString().split('T')[0],
        name: h.name
      }))
    };
  }

  // Get student attendance
  static async getStudentAttendance(studentId: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentAttendance = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const allAttendance = await prisma.attendance.findMany({
      where: { studentId }
    });

    const totalDays = allAttendance.length;
    const presentDays = allAttendance.filter(a => a.status === 'PRESENT').length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    const showAlert = percentage < 75 && percentage > 0;

    // Monthly breakdown
    const monthlyMap = new Map<string, { total: number; present: number }>();

    for (const att of allAttendance) {
      const yearValue = att.date.getFullYear();
      const monthValue = att.date.getMonth() + 1;
      const monthKey = `${yearValue}-${monthValue}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { total: 0, present: 0 });
      }
      const monthData = monthlyMap.get(monthKey)!;
      monthData.total++;
      if (att.status === 'PRESENT') {
        monthData.present++;
      }
    }

    const monthlyBreakdown: MonthlyBreakdownItem[] = [];
    
    for (const [key, data] of monthlyMap.entries()) {
      const hyphenIndex = key.indexOf('-');
      const yearStr = key.substring(0, hyphenIndex);
      const monthStr = key.substring(hyphenIndex + 1);
      
      const yearValue = parseInt(yearStr, 10);
      const monthValue = parseInt(monthStr, 10);
      
      monthlyBreakdown.push({
        year: isNaN(yearValue) ? 0 : yearValue,
        month: isNaN(monthValue) ? 0 : monthValue,
        totalDays: data.total,
        presentDays: data.present,
        percentage: data.total > 0 ? (data.present / data.total) * 100 : 0
      });
    }
    
    monthlyBreakdown.sort((a, b) => b.year - a.year || b.month - a.month);

    return {
      summary: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: Number(percentage.toFixed(2))
      },
      monthlyBreakdown,
      recentAttendance: recentAttendance.map(a => ({
        date: a.date.toISOString().split('T')[0],
        status: a.status,
        remark: a.remark
      })),
      alert: showAlert ? {
        show: true,
        message: `Your attendance is ${percentage.toFixed(2)}%. Please maintain at least 75% attendance.`
      } : null
    };
  }

  // Delete attendance (within 7 days)
  static async deleteAttendance(attendanceId: number, teacherId: number) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - attendance.date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      throw new Error('Cannot edit attendance older than 7 days');
    }

    await prisma.attendance.delete({
      where: { id: attendanceId }
    });

    return { success: true };
  }

  // ================= HOLIDAY MANAGEMENT METHODS =================

  // Check if a date is a holiday
  static async isHoliday(date: Date): Promise<{ isHoliday: boolean; holidayName?: string }> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    if (holiday) {
      return { isHoliday: true, holidayName: holiday.name };
    }
    return { isHoliday: false };
  }

  // Get all holidays
  static async getAllHolidays(year?: number, month?: number) {
    const where: any = {};
    
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = { gte: startDate, lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.date = { gte: startDate, lte: endDate };
    }
    
    return prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  // Add holiday (Admin only)
  static async addHoliday(name: string, date: string, description?: string) {
    // Check if holiday already exists on this date
    const existing = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        }
      }
    });
    
    if (existing) {
      throw new Error('Holiday already exists on this date');
    }
    
    return prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        description: description || null
      }
    });
  }

  // Delete holiday
  static async deleteHoliday(id: number) {
    return prisma.holiday.delete({ where: { id } });
  }

  // Get monthly report with holidays excluded (for PDF and reports)
  static async getMonthlyReportWithHolidays(classId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get all holidays in this month
    const holidays = await prisma.holiday.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });
    
    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

    // Get all working days (excluding holidays)
    const workingDays: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr && !holidayDates.has(dateStr)) {
        workingDays.push(dateStr);
      }
    }

    // Get class name
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    const className = classData ? `${classData.name} ${classData.section}` : 'Unknown Class';

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { rollNumber: 'asc' }
    });

    // Get attendance records (only for working days)
    const attendances = await prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate }
      }
    });

    // Calculate student-wise attendance (excluding holidays)
    const studentAttendance = students.map(student => {
      const studentAttendances = attendances.filter(a => a.studentId === student.id);
      const totalDays = workingDays.length;
      const presentDays = studentAttendances.filter(a => a.status === 'PRESENT').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        percentage: Number(percentage.toFixed(2))
      };
    });

    // Calculate class percentage (excluding holidays)
    const totalPresent = attendances.filter(a => a.status === 'PRESENT').length;
    const totalPossible = workingDays.length * students.length;
    const classPercentage = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    return {
      className,
      month,
      year,
      totalStudents: students.length,
      totalWorkingDays: workingDays.length,
      totalHolidays: holidays.length,
      holidays: holidays.map(h => ({
        date: h.date.toISOString().split('T')[0],
        name: h.name,
        description: h.description
      })),
      classPercentage: Number(classPercentage.toFixed(2)),
      students: studentAttendance
    };
  }

  // ================= PDF REPORT METHODS =================

  // Get monthly detailed report for PDF (with holidays excluded)
  static async getMonthlyDetailedReport(classId: number, month: number, year: number) {
    return this.getMonthlyReportWithHolidays(classId, month, year);
  }

  // Get yearly detailed report for PDF
  static async getYearlyDetailedReport(classId: number, year: number) {
    const startDate = new Date(year, 0, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    // Get all holidays in the year
    const holidays = await prisma.holiday.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });
    const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

    // Get class name
    const classData = await prisma.class.findUnique({
      where: { id: classId }
    });
    const className = classData ? `${classData.name} ${classData.section}` : 'Unknown Class';

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { rollNumber: 'asc' }
    });

    // Get all attendance records for the year
    const attendances = await prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate }
      }
    });

    // Calculate total working days in the year
    let totalWorkingDaysCount = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (dateStr && !holidayDates.has(dateStr)) {
        totalWorkingDaysCount++;
      }
    }

    // Monthly breakdown (excluding holidays)
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      // Get working days in this month (excluding holidays)
      let workingDaysCount = 0;
      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateStr && !holidayDates.has(dateStr)) {
          workingDaysCount++;
        }
      }
      
      const monthAttendances = attendances.filter(a => 
        a.date >= monthStart && a.date <= monthEnd
      );
      
      const presentDays = monthAttendances.filter(a => a.status === 'PRESENT').length;
      const percentage = workingDaysCount > 0 && students.length > 0 
        ? (presentDays / (workingDaysCount * students.length)) * 100 
        : 0;

      monthlyData.push({
        month,
        totalDays: workingDaysCount,
        presentDays,
        percentage: Number(percentage.toFixed(2))
      });
    }

    // Student-wise yearly summary (excluding holidays)
    const studentSummaries = students.map(student => {
      const studentAttendances = attendances.filter(a => a.studentId === student.id);
      const presentDays = studentAttendances.filter(a => a.status === 'PRESENT').length;
      const percentage = totalWorkingDaysCount > 0 ? (presentDays / totalWorkingDaysCount) * 100 : 0;

      return {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.user.name,
        totalDays: totalWorkingDaysCount,
        presentDays,
        absentDays: totalWorkingDaysCount - presentDays,
        percentage: Number(percentage.toFixed(2))
      };
    });

    // Calculate overall percentage
    const totalPresent = attendances.filter(a => a.status === 'PRESENT').length;
    const totalPossible = totalWorkingDaysCount * students.length;
    const overallPercentage = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    return {
      className,
      year,
      totalStudents: students.length,
      totalWorkingDays: totalWorkingDaysCount,
      totalHolidays: holidays.length,
      holidays: holidays.map(h => ({
        date: h.date.toISOString().split('T')[0],
        name: h.name
      })),
      overallPercentage: Number(overallPercentage.toFixed(2)),
      monthlyData,
      students: studentSummaries
    };
  }
}

export default AttendanceService;