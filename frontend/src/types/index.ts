export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Student {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  class: string;
  classId: number;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentEmail?: string;
  admissionDate: string;
  profilePhoto?: string;
  isActive: boolean;
}

export interface Teacher {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  address?: string;
  hireDate?: string;
  profilePhoto?: string;
  isActive: boolean;
}

export interface Class {
  id: number;
  name: string;
  section: string;
  displayName: string;
  studentCount?: number;
  subjectCount?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Exam {
  id: number;
  name: string;
  examType: string;
  subject: string;
  class: string;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT';
  remark?: string;
  date: string;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}