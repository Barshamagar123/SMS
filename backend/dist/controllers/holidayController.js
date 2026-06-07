// backend/src/controllers/holidayController.ts
import AttendanceService from '../services/attendanceService.js';
import { NotificationService } from '../services/notificationService.js'; // ✅ ADD THIS IMPORT
const toNumber = (val) => {
    if (!val)
        return NaN;
    return parseInt(String(val), 10);
};
// Get all holidays
export const getHolidays = async (req, res) => {
    try {
        const { year, month } = req.query;
        let yearNum;
        let monthNum;
        if (year)
            yearNum = toNumber(year);
        if (month)
            monthNum = toNumber(month);
        const holidays = await AttendanceService.getAllHolidays(yearNum, monthNum);
        res.json({ success: true, data: holidays });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ✅ UPDATED: Add holiday with real-time notifications
export const addHoliday = async (req, res) => {
    try {
        const { name, date, description } = req.body;
        if (!name || !date) {
            return res.status(400).json({
                success: false,
                message: 'Name and date are required'
            });
        }
        const holiday = await AttendanceService.addHoliday(name, date, description);
        // ✅ SEND NOTIFICATION TO ALL STUDENTS
        await NotificationService.sendToRole('STUDENT', '🏖️ Holiday Announcement', `School will remain closed on ${new Date(date).toLocaleDateString()} for ${name}.`, 'HOLIDAY', holiday.id);
        // ✅ SEND NOTIFICATION TO ALL TEACHERS
        await NotificationService.sendToRole('TEACHER', '🏖️ Holiday Announcement', `School will remain closed on ${new Date(date).toLocaleDateString()} for ${name}.`, 'HOLIDAY', holiday.id);
        // ✅ ALSO NOTIFY ADMINS (optional)
        await NotificationService.sendToRole('ADMIN', '🏖️ Holiday Added', `Holiday "${name}" has been added for ${new Date(date).toLocaleDateString()}.`, 'HOLIDAY', holiday.id);
        res.json({
            success: true,
            message: 'Holiday added successfully with notifications',
            data: holiday
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Delete holiday (Admin only)
export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const idNum = toNumber(id);
        if (isNaN(idNum)) {
            return res.status(400).json({ success: false, message: 'Invalid holiday ID' });
        }
        await AttendanceService.deleteHoliday(idNum);
        res.json({ success: true, message: 'Holiday deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get monthly report with holidays excluded
export const getMonthlyReportWithHolidays = async (req, res) => {
    try {
        const { classId } = req.params;
        const { month, year } = req.query;
        const classIdNum = toNumber(classId);
        if (isNaN(classIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid class ID' });
        }
        let monthNum = month ? toNumber(month) : new Date().getMonth() + 1;
        let yearNum = year ? toNumber(year) : new Date().getFullYear();
        if (isNaN(monthNum))
            monthNum = new Date().getMonth() + 1;
        if (isNaN(yearNum))
            yearNum = new Date().getFullYear();
        const data = await AttendanceService.getMonthlyReportWithHolidays(classIdNum, monthNum, yearNum);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=holidayController.js.map