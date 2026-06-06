// src/types/student.ts

export interface StudentProfile {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  className: string;
  classId: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentEmail?: string;
  profilePhoto?: string;
  admissionDate?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export interface MonthlyBreakdown {
  year: number;
  month: number;
  totalDays: number;
  presentDays: number;
  percentage: number;
}

export interface RecentAttendance {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remark?: string;
}

export interface AttendanceData {
  summary: AttendanceSummary;
  monthlyBreakdown: MonthlyBreakdown[];
  recentAttendance: RecentAttendance[];
  alert: { show: boolean; message: string } | null;
}

export interface ExamResult {
  examId: number;
  examName: string;
  examType: string;
  subject: string;
  subjectId: number;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  marksObtained: number;
  percentage: number;
  grade: string;
  rank?: number;
  remark?: string;
}

export interface DashboardStats {
  attendancePercentage: number;
  totalExams: number;
  averagePercentage: number;
  bestGrade: string;
  pendingFees?: number;
  upcomingExams?: number;
}