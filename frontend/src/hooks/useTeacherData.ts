// src/hooks/useTeacherData.ts

import { useState, useEffect, useCallback } from 'react';
import { teacherAssignmentApi, academicYearApi } from '../api/api';
import type { 
  TeacherProfile, 
  TeacherClass, 
  Student, 
  Exam, 
  ExamResultsSummary, 
  ScheduleDay,
  AttendanceStudent,
  MarksEntryStudent
} from '../types/teacher';
import toast from 'react-hot-toast';

// ==================== MAIN TEACHER DATA HOOK ====================
export const useTeacherData = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [myClasses, setMyClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await teacherAssignmentApi.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, []);

  const fetchMyClasses = useCallback(async () => {
    try {
      const response = await teacherAssignmentApi.getMyClasses();
      setMyClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchMyClasses()]);
    setLoading(false);
  }, [fetchProfile, fetchMyClasses]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    profile,
    myClasses,
    loading,
    refreshData: fetchAllData,
    fetchProfile,
    fetchMyClasses
  };
};

// ==================== GET CLASS STUDENTS HOOK ====================
export const useClassStudents = (classId: number | null) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (!classId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getClassStudents(classId);
        setStudents(response.data.students || []);
        setClassName(response.data.className || 'Class');
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

  return { students, loading, className };
};

// ==================== GET TEACHER EXAMS HOOK ====================
export const useTeacherExams = (academicYearId?: number) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getMyExams(academicYearId);
        setExams(response.data || []);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [academicYearId]);

  return { exams, loading };
};

// ==================== GET TEACHER SCHEDULE HOOK ====================
export const useTeacherSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getSchedule();
        setSchedule(response.data.schedule || []);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return { schedule, loading };
};

// ==================== GET TEACHER RESULTS SUMMARY HOOK ====================
export const useTeacherResultsSummary = (academicYearId?: number) => {
  const [results, setResults] = useState<ExamResultsSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getMyResultsSummary(academicYearId);
        setResults(response.data.results || []);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [academicYearId]);

  return { results, loading };
};

// ==================== GET ACTIVE ACADEMIC YEAR HOOK ====================
export const useActiveAcademicYear = () => {
  const [activeYear, setActiveYear] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const response = await academicYearApi.getActive();
        setActiveYear(response.data);
      } catch (error) {
        console.error('Failed to fetch active academic year:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveYear();
  }, []);

  return { activeYear, loading };
};

// ==================== GET STUDENTS FOR ATTENDANCE HOOK ====================
export const useAttendanceStudents = (classId: number | null, date: string) => {
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [markedCount, setMarkedCount] = useState(0);

  useEffect(() => {
    if (!classId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getStudentsForAttendance(classId, date);
        const studentsList = response.data.students || [];
        setStudents(studentsList);
        const marked = studentsList.filter((s: AttendanceStudent) => s.status !== null).length;
        setMarkedCount(marked);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, date]);

  return { students, setStudents, loading, markedCount, setMarkedCount };
};

// ==================== GET STUDENTS FOR MARKS ENTRY HOOK ====================
export const useMarksEntryStudents = (examId: number | null) => {
  const [students, setStudents] = useState<MarksEntryStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [examDetails, setExamDetails] = useState<Exam | null>(null);

  useEffect(() => {
    if (!examId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await teacherAssignmentApi.getStudentsForMarks(examId);
        setStudents(response.data || []);
        
        const examsResponse = await teacherAssignmentApi.getMyExams();
        const exam = examsResponse.data?.find((e: Exam) => e.id === examId);
        setExamDetails(exam || null);
      } catch (error) {
        console.error('Failed to fetch students for marks:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [examId]);

  return { students, setStudents, loading, examDetails };
};

// ==================== SAVE ATTENDANCE HOOK ====================
export const useSaveAttendance = () => {
  const [saving, setSaving] = useState(false);

  const saveAttendance = async (classId: number, date: string, attendances: any[]) => {
    setSaving(true);
    try {
      const response = await teacherAssignmentApi.markAttendance(classId, date, attendances);
      toast.success('Attendance saved successfully');
      return response;
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { saveAttendance, saving };
};

// ==================== SAVE MARKS HOOK ====================
export const useSaveMarks = () => {
  const [saving, setSaving] = useState(false);

  const saveMarks = async (examId: number, marks: any[]) => {
    setSaving(true);
    try {
      const response = await teacherAssignmentApi.submitMarks(examId, marks);
      toast.success('Marks saved successfully');
      return response;
    } catch (error) {
      console.error('Failed to save marks:', error);
      toast.error('Failed to save marks');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { saveMarks, saving };
};