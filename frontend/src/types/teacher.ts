// src/types/teacher.ts

export interface TeacherProfile {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  address: string;
  hireDate: string;
  profilePhoto: string | null;
  currentClasses: TeacherClass[];
}

export interface TeacherClass {
  classId: number;
  className: string;
  displayName: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  isPrimary: boolean;
  studentCount?: number;
}

export interface Student {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  admissionDate: string;
}

export interface AttendanceStudent {
  id: number;
  rollNumber: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | null;
  attendanceId: number | null;
}

export interface Exam {
  id: number;
  name: string;
  examType: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
}

export interface MarksEntryStudent {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number | null;
  remark?: string;
}

export interface ExamResultsSummary {
  examId: number;
  examName: string;
  examType: string;
  examDate: string;
  className: string;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
  statistics: {
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    passPercentage: number;
    averageMarks: number;
    highestMarks: number;
    lowestMarks: number;
  };
}

export interface ScheduleClass {
  time: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  room: string;
  isPrimary: boolean;
}

export interface ScheduleDay {
  day: string;
  classes: ScheduleClass[];
}