import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
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
  // Auth
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }),
  getMe: () => api.get('/auth/me'),
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/logout', { refreshToken });
  },
  
  // SuperAdmin/Admin
  getAllUsers: () => api.get('/auth/users'),
  createAdmin: (data: any) => api.post('/auth/admin/create', data),
  updateUser: (id: number, data: any) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
  
  // Teacher Management (Admin only)
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
  
  // Student Management (Admin only)
  createStudent: (data: any) => api.post('/auth/student/create', data),
  getStudentById: (id: number) => api.get(`/auth/students/${id}`),
  updateStudent: (id: number, data: any) => api.put(`/auth/students/${id}`, data),
  deleteStudent: (id: number) => api.delete(`/auth/students/${id}`),
  transferStudent: (studentId: number, newClassId: number, reason?: string) => 
    api.post(`/auth/students/${studentId}/transfer`, { newClassId, reason }),
  
  // Student Self
  getMyProfile: () => api.get('/auth/me/profile'),
  updateMyProfile: (data: any) => api.put('/auth/me/profile', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/auth/me/photo', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },
  deletePhoto: () => api.delete('/auth/me/photo'),

  // SuperAdmin Specific Methods
  getSuperAdminStudents: () => api.get('/auth/superadmin/students'),
  getSuperAdminAdmins: () => api.get('/auth/superadmin/admins'),
  
  // Student Details with full profile
  getStudentDetails: (studentId: number) => api.get(`/auth/students/${studentId}/details`),
  
  // Get student photo by ID (for admin/superadmin viewing)
  getStudentPhotoById: (studentId: number) => api.get(`/auth/students/${studentId}/photo`, { responseType: 'blob' }),
  
  // Get teacher photo by ID
  getTeacherPhotoById: (teacherId: number) => api.get(`/auth/teachers/${teacherId}/photo`, { responseType: 'blob' }),
  
  // Bulk operations
  bulkCreateStudents: (studentsData: any[]) => api.post('/auth/students/bulk', { students: studentsData }),
  
  // Export students data
  exportStudentsData: (format: 'csv' | 'excel' = 'csv') => 
    api.get(`/auth/students/export?format=${format}`, { responseType: 'blob' }),
  
  // Get student statistics
  getStudentStatistics: () => api.get('/auth/students/statistics'),
  
  // Update student status (activate/deactivate)
  updateStudentStatus: (studentId: number, isActive: boolean) => 
    api.patch(`/auth/students/${studentId}/status`, { isActive }),
  
  // Reset student password
  resetStudentPassword: (studentId: number) => 
    api.post(`/auth/students/${studentId}/reset-password`),
};

// ==================== CLASS API ====================
export const classApi = {
  getAll: () => api.get('/classes'),
  getById: (id: number) => api.get(`/classes/${id}`),
  create: (data: any) => api.post('/classes', data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
  getSubjects: (classId: number) => api.get(`/classes/${classId}/subjects`),
  assignSubject: (classId: number, subjectId: number) => 
    api.post(`/classes/${classId}/subjects`, { subjectId }),
  removeSubject: (classId: number, subjectId: number) => 
    api.delete(`/classes/${classId}/subjects/${subjectId}`),
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
  getStudents: (classId: number, date?: string) => 
    api.get(`/attendance/class/${classId}/students`, { params: { date } }),
  markAttendance: (classId: number, data: any) => 
    api.post(`/attendance/class/${classId}/mark`, data),
  getReport: (classId: number, month?: number, year?: number) => 
    api.get(`/attendance/class/${classId}/report`, { params: { month, year } }),
  deleteAttendance: (id: number) => api.delete(`/attendance/${id}`),
  getMyAttendance: () => api.get('/attendance/me'),
  downloadMonthlyReport: (classId: number, month: number, year: number) =>
    api.get(`/attendance/class/${classId}/download-monthly`, { 
      params: { month, year }, 
      responseType: 'blob' 
    }),
  downloadYearlyReport: (classId: number, year: number) =>
    api.get(`/attendance/class/${classId}/download-yearly`, { 
      params: { year }, 
      responseType: 'blob' 
    }),
};

// ==================== HOLIDAY API ====================
export const holidayApi = {
  getAll: (year?: number, month?: number) => 
    api.get('/holidays', { params: { year, month } }),
  create: (data: any) => api.post('/holidays', data),
  delete: (id: number) => api.delete(`/holidays/${id}`),
  getReport: (classId: number, month: number, year: number) => 
    api.get(`/holidays/report/class/${classId}`, { params: { month, year } }),
};

// ==================== EXAM API ====================
export const examApi = {
  getTypes: () => api.get('/exams/types'),
  createType: (data: any) => api.post('/exams/types', data),
  create: (data: any) => api.post('/exams', data),
  getByClass: (classId: number, academicYearId: number) => 
    api.get(`/exams/class/${classId}`, { params: { academicYearId } }),
  getForTeacher: (academicYearId: number) => 
    api.get('/exams/teacher/my-exams', { params: { academicYearId } }),
  getStudentsForMarks: (examId: number) => api.get(`/exams/${examId}/students`),
  enterMarks: (examId: number, marks: any[]) => 
    api.post(`/exams/${examId}/marks`, { marks }),
  getResults: (examId: number) => api.get(`/exams/${examId}/results`),
  lockExam: (examId: number) => api.post(`/exams/${examId}/lock`),
  unlockExam: (examId: number) => api.post(`/exams/${examId}/unlock`),
  getMyResults: (academicYearId?: number) => 
    api.get('/exams/my-results', { params: { academicYearId } }),
  initGrades: () => api.post('/exams/init-grades'),
};

// ==================== REPORT CARD API ====================
export const reportCardApi = {
  downloadSingle: (studentId: number, examId: number) => 
    api.get(`/report-cards/student/${studentId}/exam/${examId}`, { responseType: 'blob' }),
  getStudentsForExam: (examId: number) => 
    api.get(`/report-cards/exam/${examId}/students`),
  bulkDownload: (examId: number, studentIds: number[]) => 
    api.post(`/report-cards/exam/${examId}/bulk-download`, { studentIds }, { responseType: 'blob' }),
};

export default api;