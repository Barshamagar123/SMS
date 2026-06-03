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
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await teacherAssignmentApi.getProfile();
      if (response.data) {
        setProfile(response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setError(error.message);
      return null;
    }
  }, []);

  const fetchMyClasses = useCallback(async () => {
    try {
      const response = await teacherAssignmentApi.getMyClasses();
      console.log('MyClasses API Response:', response.data);
      
      // Handle different response structures
      let classes = [];
      if (response.data?.classes) {
        classes = response.data.classes;
      } else if (Array.isArray(response.data)) {
        classes = response.data;
      } else if (response.data?.data?.classes) {
        classes = response.data.data.classes;
      }
      
      setMyClasses(classes || []);
      return classes;
    } catch (error: any) {
      console.error('Failed to fetch classes:', error);
      setError(error.message);
      return [];
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProfile(), fetchMyClasses()]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchMyClasses]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    profile,
    myClasses,
    loading,
    error,
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
        setStudents(response.data?.students || []);
        setClassName(response.data?.className || 'Class');
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
        setSchedule(response.data?.schedule || []);
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
        setResults(response.data?.results || []);
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      console.log('No classId provided, skipping attendance fetch');
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching attendance students for class ${classId} on date ${date}`);
        
        // First, try to get students from teacher-assignments endpoint
        let studentsList = [];
        
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`http://localhost:3000/api/teacher-assignments/class/${classId}/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          console.log('Teacher-assignments response:', data);
          
          if (data.success && data.data?.students) {
            studentsList = data.data.students;
          }
        } catch (err) {
          console.error('Error fetching from teacher-assignments:', err);
        }
        
        // If no students found, try the attendance endpoint
        if (studentsList.length === 0) {
          try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:3000/api/attendance/class/${classId}/students?date=${date}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Attendance endpoint response:', data);
            
            if (data.success && data.data?.students) {
              studentsList = data.data.students;
            }
          } catch (err) {
            console.error('Error fetching from attendance endpoint:', err);
          }
        }
        
        // Format students for the table
        const formattedStudents = studentsList.map((student: any) => ({
          id: student.id || student.studentId,
          rollNumber: student.rollNumber,
          name: student.name || student.studentName,
          status: student.status || null,
          attendanceId: student.attendanceId || null
        }));
        
        console.log('Formatted students:', formattedStudents);
        setStudents(formattedStudents);
        
        const marked = formattedStudents.filter((s: AttendanceStudent) => s.status !== null).length;
        setMarkedCount(marked);
        
        if (formattedStudents.length === 0) {
          setError('No students found in this class. Please ensure students are enrolled.');
        }
        
      } catch (error) {
        console.error('Failed to fetch attendance students:', error);
        setError('Failed to load students. Please try again.');
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, date]);

  return { students, setStudents, loading, markedCount, setMarkedCount, error };
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
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to save attendance');
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
    } catch (error: any) {
      console.error('Failed to save marks:', error);
      toast.error(error.response?.data?.message || 'Failed to save marks');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return { saveMarks, saving };
};