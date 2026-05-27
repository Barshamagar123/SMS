import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import AttendanceService from '../services/attendanceService.js';

const toNumber = (val: any): number => {
  if (!val) return NaN;
  return parseInt(String(val), 10);
};

// Get all holidays
export const getHolidays = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { year, month } = req.query;
    
    let yearNum: number | undefined;
    let monthNum: number | undefined;
    
    if (year) yearNum = toNumber(year);
    if (month) monthNum = toNumber(month);
    
    const holidays = await AttendanceService.getAllHolidays(yearNum, monthNum);
    
    res.json({ success: true, data: holidays });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add holiday (Admin only)
export const addHoliday = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, date, description } = req.body;
    
    if (!name || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and date are required' 
      });
    }
    
    const holiday = await AttendanceService.addHoliday(name, date, description);
    
    res.json({ 
      success: true, 
      message: 'Holiday added successfully',
      data: holiday 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete holiday (Admin only)
export const deleteHoliday = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idNum = toNumber(id);
    
    if (isNaN(idNum)) {
      return res.status(400).json({ success: false, message: 'Invalid holiday ID' });
    }
    
    await AttendanceService.deleteHoliday(idNum);
    
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get monthly report with holidays excluded
export const getMonthlyReportWithHolidays = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;
    
    const classIdNum = toNumber(classId);
    if (isNaN(classIdNum)) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    
    let monthNum = month ? toNumber(month) : new Date().getMonth() + 1;
    let yearNum = year ? toNumber(year) : new Date().getFullYear();
    
    if (isNaN(monthNum)) monthNum = new Date().getMonth() + 1;
    if (isNaN(yearNum)) yearNum = new Date().getFullYear();
    
    const data = await AttendanceService.getMonthlyReportWithHolidays(classIdNum, monthNum, yearNum);
    
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};