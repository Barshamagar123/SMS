import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class AttendanceService {
    // Get students by class for marking attendance
    static async getStudentsByClass(classId, date) {
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
    static async markAttendance(classId, date, attendances, markedBy) {
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
            }
            else {
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
    static async getTeacherClasses(teacherUserId) {
        const teacher = await prisma.teacher.findFirst({
            where: { userId: teacherUserId }
        });
        if (!teacher)
            return [];
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
        const uniqueClasses = [];
        const seenIds = new Set();
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
    static async getAttendanceByClass(classId, month, year) {
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(currentYear, currentMonth, 0);
        endDate.setHours(23, 59, 59, 999);
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
        const dailySummary = {};
        for (const att of attendances) {
            const dateStr = att.date.toISOString().split('T')[0];
            if (dateStr) {
                if (!dailySummary[dateStr]) {
                    dailySummary[dateStr] = { total: 0, present: 0, absent: 0 };
                }
                dailySummary[dateStr].total++;
                if (att.status === 'PRESENT') {
                    dailySummary[dateStr].present++;
                }
                else {
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
            totalRecords
        };
    }
    // Get student attendance
    static async getStudentAttendance(studentId) {
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
        // Monthly breakdown - FIXED: Use numbers directly, no string splitting
        const monthlyMap = new Map();
        for (const att of allAttendance) {
            const yearValue = att.date.getFullYear();
            const monthValue = att.date.getMonth() + 1;
            const monthKey = `${yearValue}-${monthValue}`;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { total: 0, present: 0 });
            }
            const monthData = monthlyMap.get(monthKey);
            monthData.total++;
            if (att.status === 'PRESENT') {
                monthData.present++;
            }
        }
        const monthlyBreakdown = [];
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
    static async deleteAttendance(attendanceId, teacherId) {
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
}
export default AttendanceService;
//# sourceMappingURL=attendanceService.js.map