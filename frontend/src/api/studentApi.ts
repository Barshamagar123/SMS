// src/services/studentApi.ts

import api from './api';

export const studentApi = {
  // Dashboard
  getDashboard: () => api.get('/student/dashboard'),
  
  // Attendance
  getMyAttendance: (params?: { month?: number; year?: number }) => 
    api.get('/student/attendance', { params }),
  getAttendanceSummary: () => api.get('/student/attendance/summary'),
  getAttendanceCalendar: (month?: number, year?: number) => 
    api.get('/student/attendance/calendar', { params: { month, year } }),
  getAttendancePercentage: () => api.get('/student/attendance/percentage'),
  
  // Results
  getMyResults: (params?: { examType?: string; examId?: number; subject?: string }) => 
    api.get('/student/results', { params }),
  getResultSummary: () => api.get('/student/results/summary'),
  getSubjectWiseResults: () => api.get('/student/results/subject-wise'),
  getExamWiseResults: () => api.get('/student/results/exam-wise'),
  getOverallPerformance: () => api.get('/student/results/overall'),
  getResultAnalytics: () => api.get('/student/results/analytics'),
  getGradeHistory: () => api.get('/student/results/grades'),
  getSubjectPerformance: (subjectId?: number) => 
    api.get('/student/results/subject-performance', { params: { subjectId } }),
  
  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data: Partial<{
    name: string;
    phone: string;
    address: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
  }>) => api.put('/student/profile', data),
  updateProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/student/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProfilePhoto: () => api.delete('/student/profile/photo'),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/student/change-password', { currentPassword, newPassword }),
  
  // Classmates
  getClassmates: () => api.get('/student/classmates'),
  getClassmateDetails: (studentId: number) => api.get(`/student/classmates/${studentId}`),
  
  // Teachers
  getMyTeachers: () => api.get('/student/teachers'),
  getTeacherDetails: (teacherId: number) => api.get(`/student/teachers/${teacherId}`),
  
  // Timetable
  getTimetable: () => api.get('/student/timetable'),
  getTodayTimetable: () => api.get('/student/timetable/today'),
  getTimetableByDay: (day: string) => api.get(`/student/timetable/day/${day}`),
  
  // Report Card
  getReportCard: (examId: number) => api.get(`/student/report-card/${examId}`, { responseType: 'blob' }),
  
  // Fees
  getFeeStatus: () => api.get('/student/fees'),
  getFeeDetails: (feeId: number) => api.get(`/student/fees/${feeId}`),
  getFeeHistory: () => api.get('/student/fees/history'),
  getPendingFees: () => api.get('/student/fees/pending'),
  
  // Announcements
  getAnnouncements: () => api.get('/student/announcements'),
  getAnnouncementById: (id: number) => api.get(`/student/announcements/${id}`),
  getRecentAnnouncements: (limit: number = 5) => 
    api.get('/student/announcements/recent', { params: { limit } }),
  markAnnouncementRead: (id: number) => api.post(`/student/announcements/${id}/read`),
  
  // Academic Calendar
  getAcademicCalendar: () => api.get('/student/academic-calendar'),
  getEvents: (params?: { startDate?: string; endDate?: string; eventType?: string }) => 
    api.get('/student/calendar/events', { params }),
  getHolidays: () => api.get('/student/calendar/holidays'),
  getExamSchedule: () => api.get('/student/calendar/exams'),
  
  // Downloads
  getDownloads: () => api.get('/student/downloads'),
  getDownloadById: (id: number) => api.get(`/student/downloads/${id}`, { responseType: 'blob' }),
  getStudyMaterials: (subjectId?: number) => 
    api.get('/student/downloads/study-materials', { params: { subjectId } }),
  getPreviousPapers: () => api.get('/student/downloads/previous-papers'),
  getAssignments: () => api.get('/student/downloads/assignments'),
  
  // Performance Analytics
  getPerformanceAnalytics: () => api.get('/student/analytics'),
  getSubjectTrends: () => api.get('/student/analytics/subject-trends'),
  getComparativeAnalysis: () => api.get('/student/analytics/comparative'),
  getWeaknessStrengths: () => api.get('/student/analytics/weakness-strengths'),
  getProgressReport: () => api.get('/student/analytics/progress'),
  
  // Notifications
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id: number) => api.post(`/student/notifications/${id}/read`),
  markAllRead: () => api.post('/student/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/student/notifications/unread-count'),
};