import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
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
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post('/auth/logout', { refreshToken });
  },
  
  // Admin only
  createStudent: (data: any) => api.post('/auth/student/create', data),
  createTeacher: (data: any) => api.post('/auth/teacher/create', data),
  getAllUsers: () => api.get('/auth/users'),
  transferStudent: (studentId: number, newClassId: number, reason?: string) => 
    api.post(`/auth/students/${studentId}/transfer`, { newClassId, reason }),
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
  create: (data: any) => api.post('/exams', data),
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