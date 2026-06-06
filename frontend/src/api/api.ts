// src/services/api.ts (or src/api/api.ts)

import * as axios from 'axios';
const axiosClient = (axios as any).default || axios;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axiosClient.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/logout', { refreshToken });
  },
  getAllUsers: () => api.get('/auth/users'),
  createAdmin: (data: any) => api.post('/auth/admin/create', data),
  updateUser: (id: number, data: any) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
  createTeacher: (data: any) => api.post('/auth/teacher/create', data),
  getAllTeachers: () => api.get('/auth/teachers'),
  getTeacherById: (id: number) => api.get(`/auth/teachers/${id}`),
  updateTeacher: (id: number, data: any) => api.put(`/auth/teachers/${id}`, data),
  deleteTeacher: (id: number) => api.delete(`/auth/teachers/${id}`),
  getOwnTeacherProfile: () => api.get('/auth/teachers/me'),
  uploadTeacherPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/auth/teachers/me/photo', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },
  resetTeacherPassword: (teacherId: number) => api.post(`/auth/teachers/${teacherId}/reset-password`),
  updateTeacherStatus: (teacherId: number, isActive: boolean) => api.patch(`/auth/teachers/${teacherId}/status`, { isActive }),
  getTeacherPhotoById: (teacherId: number) => api.get(`/auth/teachers/${teacherId}/photo`, { responseType: 'blob' }),
  createStudent: (data: any) => api.post('/auth/student/create', data),
  getStudentById: (id: number) => api.get(`/auth/students/${id}`),
  updateStudent: (id: number, data: any) => api.put(`/auth/students/${id}`, data),
  deleteStudent: (id: number) => api.delete(`/auth/students/${id}`),
  transferStudent: (studentId: number, newClassId: number, reason?: string) => api.post(`/auth/students/${studentId}/transfer`, { newClassId, reason }),
  getMyProfile: () => api.get('/auth/me/profile'),
  updateMyProfile: (data: any) => api.put('/auth/me/profile', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/auth/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deletePhoto: () => api.delete('/auth/me/photo'),
  getSuperAdminStudents: () => api.get('/auth/superadmin/students'),
  getSuperAdminAdmins: () => api.get('/auth/superadmin/admins'),
  getStudentDetails: (studentId: number) => api.get(`/auth/students/${studentId}/details`),
  getStudentPhotoById: (studentId: number) => api.get(`/auth/students/${studentId}/photo`, { responseType: 'blob' }),
  bulkCreateStudents: (studentsData: any[]) => api.post('/auth/students/bulk', { students: studentsData }),
  exportStudentsData: (format: 'csv' | 'excel' = 'csv') => api.get(`/auth/students/export?format=${format}`, { responseType: 'blob' }),
  getStudentStatistics: () => api.get('/auth/students/statistics'),
  updateStudentStatus: (studentId: number, isActive: boolean) => api.patch(`/auth/students/${studentId}/status`, { isActive }),
  resetStudentPassword: (studentId: number) => api.post(`/auth/students/${studentId}/reset-password`),
};

// ==================== ASSIGNMENT API (NEW) ====================
export const assignmentApi = {
  // Student
  getMyAssignments: () => api.get('/assignments/my-assignments'),
  getAssignmentById: (id: number) => api.get(`/assignments/${id}`),
  submitAssignment: (assignmentId: number, files: File[], comment?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (comment) formData.append('comment', comment);
    return api.post(`/assignments/submit/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Teacher
  getTeacherAssignments: () => api.get('/assignments/teacher/assignments'),
  createAssignment: (data: any, files: File[]) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    files.forEach(file => formData.append('files', file));
    return api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateAssignment: (id: number, data: any) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id: number) => api.delete(`/assignments/${id}`),
  gradeSubmission: (submissionId: number, marksObtained: number, feedback?: string) => 
    api.post(`/assignments/grade/${submissionId}`, { marksObtained, feedback }),
  
  // Download
  downloadFile: (type: 'assignment' | 'submission', fileId: number) => 
    api.get(`/assignments/download/${type}/${fileId}`, { responseType: 'blob' })
};

// ==================== NOTIFICATION API (NEW) ====================
export const notificationApi = {
  getNotifications: (page: number = 1, limit: number = 20) => 
    api.get(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/notifications')
};

// ==================== STUDENT API (Student Dashboard) ====================
export const studentApi = {
  // Dashboard
  getDashboard: () => api.get('/student/dashboard'),
  
  // Attendance
  getMyAttendance: (params?: { month?: number; year?: number }) => api.get('/student/attendance', { params }),
  getAttendanceSummary: () => api.get('/student/attendance/summary'),
  getAttendanceCalendar: (month?: number, year?: number) => api.get('/student/attendance/calendar', { params: { month, year } }),
  getAttendancePercentage: () => api.get('/student/attendance/percentage'),
  
  // Results
  getMyResults: (params?: { examType?: string; examId?: number; subject?: string }) => api.get('/student/results', { params }),
  getResultSummary: () => api.get('/student/results/summary'),
  getSubjectWiseResults: () => api.get('/student/results/subject-wise'),
  getExamWiseResults: () => api.get('/student/results/exam-wise'),
  getOverallPerformance: () => api.get('/student/results/overall'),
  getResultAnalytics: () => api.get('/student/results/analytics'),
  getGradeHistory: () => api.get('/student/results/grades'),
  getSubjectPerformance: (subjectId?: number) => api.get('/student/results/subject-performance', { params: { subjectId } }),
  
  // Profile
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data: any) => api.put('/student/profile', data),
  updateProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/student/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteProfilePhoto: () => api.delete('/student/profile/photo'),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/student/change-password', { currentPassword, newPassword }),
  
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
  
  // Fees
  getFeeStatus: () => api.get('/student/fees'),
  getFeeDetails: (feeId: number) => api.get(`/student/fees/${feeId}`),
  getFeeHistory: () => api.get('/student/fees/history'),
  getPendingFees: () => api.get('/student/fees/pending'),
  
  // Announcements
  getAnnouncements: () => api.get('/student/announcements'),
  getAnnouncementById: (id: number) => api.get(`/student/announcements/${id}`),
  getRecentAnnouncements: (limit: number = 5) => api.get('/student/announcements/recent', { params: { limit } }),
  markAnnouncementRead: (id: number) => api.post(`/student/announcements/${id}/read`),
  
  // Academic Calendar
  getAcademicCalendar: () => api.get('/student/academic-calendar'),
  getEvents: (params?: { startDate?: string; endDate?: string; eventType?: string }) => api.get('/student/calendar/events', { params }),
  getHolidays: () => api.get('/student/calendar/holidays'),
  getExamSchedule: () => api.get('/student/calendar/exams'),
  
  // Notifications (deprecated - use notificationApi instead)
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id: number) => api.post(`/student/notifications/${id}/read`),
  markAllRead: () => api.post('/student/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/student/notifications/unread-count'),
};

// ==================== TEACHER ASSIGNMENT API ====================
export const teacherAssignmentApi = {
  getMyClasses: () => api.get('/teacher-assignments/my-classes'),
  getClassStudents: (classId: number) => api.get(`/teacher-assignments/class/${classId}/students`),
  getSchedule: () => api.get('/teacher-assignments/schedule'),
  getMyResultsSummary: (academicYearId?: number) => api.get('/teacher-assignments/my-results-summary', { params: { academicYearId } }),
  getAllAssignments: () => api.get('/teacher-assignments'),
  getAssignmentsByAcademicYear: (academicYearId: number) => api.get(`/teacher-assignments/academic-year/${academicYearId}`),
  getCurrentYearAssignments: () => api.get('/teacher-assignments/current-year'),
  getProfile: () => api.get('/auth/teachers/me'),
  updateProfile: (data: { phone?: string; address?: string }) => api.put('/auth/me/profile', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/auth/teachers/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deletePhoto: () => api.delete('/auth/teachers/me/photo'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
  getStudentsForAttendance: (classId: number, date?: string) => api.get(`/attendance/class/${classId}/students`, { params: { date } }),
  markAttendance: (classId: number, date: string, attendances: any[]) => api.post(`/attendance/class/${classId}/mark`, { date, attendances }),
  getMyExams: (academicYearId?: number) => api.get('/exams/teacher/my-exams', { params: { academicYearId } }),
  getStudentsForMarks: (examId: number) => api.get(`/exams/${examId}/students`),
  submitMarks: (examId: number, marks: any[]) => api.post(`/exams/${examId}/marks`, { marks }),
  getExamResults: (examId: number) => api.get(`/exams/${examId}/results`),
};

// ==================== ACADEMIC YEAR API ====================
export const academicYearApi = {
  getAll: () => api.get('/teacher-assignments/academic-years'),
  getActive: () => api.get('/teacher-assignments/academic-years/active'),
  getById: (id: number) => api.get(`/teacher-assignments/academic-years/${id}`),
  create: (data: { year: string; startDate: string; endDate: string; isActive: boolean }) => api.post('/teacher-assignments/academic-years', data),
  update: (id: number, data: any) => api.put(`/teacher-assignments/academic-years/${id}`, data),
  delete: (id: number) => api.delete(`/teacher-assignments/academic-years/${id}`),
  setActive: (id: number) => api.patch(`/teacher-assignments/academic-years/${id}/set-active`),
};

// ==================== CLASS API ====================
export const classApi = {
  getAll: () => api.get('/classes'),
  getById: (id: number) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
  getSubjects: (classId: number) => api.get(`/classes/${classId}/subjects`),
  assignSubject: (classId: number, subjectId: number) => api.post(`/classes/${classId}/subjects`, { subjectId }),
  removeSubject: (classId: number, subjectId: number) => api.delete(`/classes/${classId}/subjects/${subjectId}`),
};

// ==================== SUBJECT API ====================
export const subjectApi = {
  getAll: () => api.get('/subjects'),
  getById: (id: number) => api.get(`/subjects/${id}`),
  create: (data: any) => api.post('/subjects', data),
  update: (id: number, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
};

// ==================== ATTENDANCE API ====================
export const attendanceApi = {
  getMyClasses: () => api.get('/attendance/my-classes'),
  getStudents: (classId: number, date?: string) => api.get(`/attendance/class/${classId}/students`, { params: { date } }),
  markAttendance: (classId: number, data: any) => api.post(`/attendance/class/${classId}/mark`, data),
  getReport: (classId: number, month?: number, year?: number) => api.get(`/attendance/class/${classId}/report`, { params: { month, year } }),
  deleteAttendance: (id: number) => api.delete(`/attendance/${id}`),
  getMyAttendance: () => api.get('/attendance/me'),
  downloadMonthlyReport: (classId: number, month: number, year: number) => api.get(`/attendance/class/${classId}/download-monthly`, { params: { month, year }, responseType: 'blob' }),
  downloadYearlyReport: (classId: number, year: number) => api.get(`/attendance/class/${classId}/download-yearly`, { params: { year }, responseType: 'blob' }),
};

// ==================== HOLIDAY API ====================
export const holidayApi = {
  getAll: (year?: number, month?: number) => api.get('/holidays', { params: { year, month } }),
  create: (data: any) => api.post('/holidays', data),
  delete: (id: number) => api.delete(`/holidays/${id}`),
  getReport: (classId: number, month: number, year: number) => api.get(`/holidays/report/class/${classId}`, { params: { month, year } }),
};

// ==================== EXAM API ====================
export const examApi = {
  getTypes: () => api.get('/exams/types'),
  createType: (data: any) => api.post('/exams/types', data),
  create: (data: any) => api.post('/exams', data),
  getByClass: (classId: number, academicYearId: number) => api.get(`/exams/class/${classId}`, { params: { academicYearId } }),
  getForTeacher: (academicYearId: number) => api.get('/exams/teacher/my-exams', { params: { academicYearId } }),
  getStudentsForMarks: (examId: number) => api.get(`/exams/${examId}/students`),
  enterMarks: (examId: number, marks: any[]) => api.post(`/exams/${examId}/marks`, { marks }),
  getResults: (examId: number) => api.get(`/exams/${examId}/results`),
  lockExam: (examId: number) => api.post(`/exams/${examId}/lock`),
  unlockExam: (examId: number) => api.post(`/exams/${examId}/unlock`),
  getMyResults: (academicYearId?: number) => api.get('/exams/my-results', { params: { academicYearId } }),
  initGrades: () => api.post('/exams/init-grades'),
};

// ==================== REPORT CARD API ====================
export const reportCardApi = {
  downloadSingle: (studentId: number, examId: number) => api.get(`/report-cards/student/${studentId}/exam/${examId}`, { responseType: 'blob' }),
  getStudentsForExam: (examId: number) => api.get(`/report-cards/exam/${examId}/students`),
  bulkDownload: (examId: number, studentIds: number[]) => api.post(`/report-cards/exam/${examId}/bulk-download`, { studentIds }, { responseType: 'blob' }),
};

export default api;