// src/pages/teacher/EnterMarks.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Save, Loader2, Lock, CheckCircle, AlertCircle,
  School, BookOpen, Calendar, Sparkles, Users, Award,
  Eye, XCircle, Database, History, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeacherClass {
  classId: number;
  className: string;
  displayName: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
}

interface Exam {
  id: number;
  name: string;
  examType: string;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
  classId: number;
  subjectId: number;
}

interface StudentMark {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number | null;
  remark?: string;
}

const TeacherEnterMarks: React.FC = () => {
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');
  
  const [availableSubjects, setAvailableSubjects] = useState<TeacherClass[]>([]);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [backupStudents, setBackupStudents] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [examDetails, setExamDetails] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    fetchActiveAcademicYear();
    fetchTeacherClasses();
    checkDatabaseConnection();
  }, []);

  useEffect(() => {
    if (academicYearId && selectedClassId && selectedSubjectId) {
      fetchExams();
    }
  }, [academicYearId, selectedClassId, selectedSubjectId]);

  useEffect(() => {
    if (selectedExam) {
      fetchStudents();
      fetchExamDetails();
      setIsEditMode(false);
    }
  }, [selectedExam]);

  const checkDatabaseConnection = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDbConnectionStatus('connected');
      } else {
        setDbConnectionStatus('disconnected');
      }
    } catch (error) {
      setDbConnectionStatus('disconnected');
    }
  };

  const fetchActiveAcademicYear = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/academic-years/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAcademicYearId(data.data.id);
      }
    } catch (error) {
      console.error('Failed to fetch academic year:', error);
    }
  };

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        let classes = [];
        if (data.data?.classes) {
          classes = data.data.classes;
        } else if (Array.isArray(data.data)) {
          classes = data.data;
        }
        
        setTeacherClasses(classes);
        
        if (classes.length > 0) {
          const uniqueClassIds = [...new Set(classes.map(c => c.classId))];
          
          if (uniqueClassIds.length > 0) {
            const firstClassId = uniqueClassIds[0];
            const firstClass = classes.find(c => c.classId === firstClassId);
            
            if (firstClass) {
              setSelectedClassId(firstClassId.toString());
              setSelectedClassName(firstClass.displayName);
              
              const subjectsForClass = classes.filter(c => c.classId === firstClassId);
              setAvailableSubjects(subjectsForClass);
              
              if (subjectsForClass.length > 0) {
                setSelectedSubjectId(subjectsForClass[0].subjectId.toString());
                setSelectedSubjectName(subjectsForClass[0].subjectName);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    if (!academicYearId || !selectedClassId || !selectedSubjectId) return;
    
    setLoading(true);
    setError(null);
    setSelectedExam('');
    setStudents([]);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/teacher/my-exams?academicYearId=${academicYearId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const filteredExams = data.data.filter(
          (exam: any) => exam.classId.toString() === selectedClassId && 
                         exam.subjectId.toString() === selectedSubjectId
        );
        
        setExams(filteredExams);
        
        if (filteredExams.length === 0) {
          setError(`No exams found for ${selectedSubjectName}`);
        }
      } else {
        setError(data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams');
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async () => {
    if (!selectedExam) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data?.exam) {
        setExamDetails(data.data.exam);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setStudents(data.data);
        setBackupStudents(JSON.parse(JSON.stringify(data.data)));
      } else {
        toast.error(data.message || 'Failed to fetch students');
        setStudents([]);
        setBackupStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
      setStudents([]);
      setBackupStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: number, marks: number) => {
    if (!isEditMode) {
      toast.error('Please click Edit button first to modify marks');
      return;
    }
    if (examDetails && marks > examDetails.maxMarks) {
      toast.error(`Marks cannot exceed ${examDetails.maxMarks}`);
      return;
    }
    if (marks < 0) {
      toast.error(`Marks cannot be negative`);
      return;
    }
    
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, marksObtained: marks } : s
    ));
    setSaveStatus('idle');
  };

  const handleRemarkChange = (studentId: number, remark: string) => {
    if (!isEditMode) {
      toast.error('Please click Edit button first to modify remarks');
      return;
    }
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, remark } : s
    ));
    setSaveStatus('idle');
  };

  const handleMarkAllFull = () => {
    if (!isEditMode) {
      toast.error('Please click Edit button first');
      return;
    }
    if (!examDetails) return;
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: examDetails.maxMarks })));
    toast.success(`All students marked with full marks (${examDetails.maxMarks})`);
    setSaveStatus('idle');
  };

  const handleMarkAllPassing = () => {
    if (!isEditMode) {
      toast.error('Please click Edit button first');
      return;
    }
    if (!examDetails) return;
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: examDetails.passingMarks })));
    toast.success(`All students marked with passing marks (${examDetails.passingMarks})`);
    setSaveStatus('idle');
  };

  const handleClearAll = () => {
    if (!isEditMode) {
      toast.error('Please click Edit button first');
      return;
    }
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: null })));
    toast.success('All marks cleared');
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    
    if (students.length === 0) {
      toast.error('No students to save marks for');
      return;
    }
    
    const invalidMarks = students.filter(s => 
      s.marksObtained !== null && (s.marksObtained < 0 || s.marksObtained > (examDetails?.maxMarks || 0))
    );
    
    if (invalidMarks.length > 0) {
      toast.error(`Invalid marks for ${invalidMarks.length} student(s). Marks must be between 0 and ${examDetails?.maxMarks}`);
      return;
    }
    
    const marksData = students.map(s => ({
      studentId: s.studentId,
      marksObtained: s.marksObtained !== null ? s.marksObtained : 0,
      remark: s.remark || null
    }));

    setSaving(true);
    setSaveStatus('saving');
    const savingToast = toast.loading('Saving marks to database...');
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/marks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ marks: marksData })
      });
      
      const data = await response.json();
      
      toast.dismiss(savingToast);
      
      if (data.success) {
        setSaveStatus('success');
        setBackupStudents(JSON.parse(JSON.stringify(students)));
        
        const saveRecord = {
          timestamp: new Date().toISOString(),
          examId: selectedExam,
          examName: examDetails?.name,
          studentCount: students.length
        };
        
        sessionStorage.setItem('lastMarksSave', JSON.stringify(saveRecord));
        
        toast.success(`✅ Marks saved successfully! ${students.length} student(s) updated`);
        
        setIsEditMode(false);
        
      } else {
        setSaveStatus('error');
        toast.error(data.message || 'Failed to save marks');
      }
    } catch (error) {
      toast.dismiss(savingToast);
      console.error('Failed to save marks:', error);
      setSaveStatus('error');
      toast.error('Failed to save marks. Check your network connection.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        if (saveStatus === 'success') {
          setSaveStatus('idle');
        }
      }, 3000);
    }
  };

  const handleEditMode = () => {
    setIsEditMode(true);
    toast.success('Edit mode enabled. You can now modify marks.');
  };

  const handleCancelEdit = () => {
    setStudents(JSON.parse(JSON.stringify(backupStudents)));
    setIsEditMode(false);
    toast.success('Edit cancelled. Reverted to last saved marks.');
  };

  const handleLockExam = async () => {
    if (!selectedExam) return;
    
    if (!confirm('Are you sure you want to lock this exam? Once locked, marks cannot be edited.')) return;
    
    setLocking(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/lock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Exam locked successfully');
        setExamDetails(prev => prev ? { ...prev, isLocked: true } : null);
        setIsEditMode(false);
      } else {
        toast.error(data.message || 'Failed to lock exam');
      }
    } catch (error) {
      console.error('Failed to lock exam:', error);
      toast.error('Failed to lock exam');
    } finally {
      setLocking(false);
    }
  };

  const handleClassChange = (classId: string) => {
    const classIdNum = parseInt(classId);
    const subjectsForClass = teacherClasses.filter(c => c.classId === classIdNum);
    
    setAvailableSubjects(subjectsForClass);
    setSelectedClassId(classId);
    setSelectedClassName(subjectsForClass[0]?.displayName || '');
    
    if (subjectsForClass.length > 0) {
      setSelectedSubjectId(subjectsForClass[0].subjectId.toString());
      setSelectedSubjectName(subjectsForClass[0].subjectName);
    } else {
      setSelectedSubjectId('');
      setSelectedSubjectName('');
    }
    
    setSelectedExam('');
    setStudents([]);
    setSaveStatus('idle');
    setIsEditMode(false);
    setError(null);
  };

  const handleSubjectChange = (subjectId: string) => {
    const selected = availableSubjects.find(s => s.subjectId.toString() === subjectId);
    if (selected) {
      setSelectedSubjectId(subjectId);
      setSelectedSubjectName(selected.subjectName);
      setSelectedExam('');
      setStudents([]);
      setIsEditMode(false);
      setError(null);
    }
  };

  const marksEntered = students.filter(s => s.marksObtained !== null).length;
  const pendingEntries = students.length - marksEntered;
  const isLocked = examDetails?.isLocked;

  const uniqueClasses = teacherClasses.reduce((acc, curr) => {
    if (!acc.find(c => c.classId === curr.classId)) {
      acc.push(curr);
    }
    return acc;
  }, [] as TeacherClass[]);

  const SaveStatusIndicator = () => {
    if (saveStatus === 'idle') return null;
    
    return (
      <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
        saveStatus === 'saving' ? 'bg-blue-500 text-white' :
        saveStatus === 'success' ? 'bg-green-500 text-white' :
        'bg-red-500 text-white'
      } transition-all duration-300`}>
        {saveStatus === 'saving' && <Loader2 size={20} className="animate-spin" />}
        {saveStatus === 'success' && <CheckCircle size={20} />}
        {saveStatus === 'error' && <AlertCircle size={20} />}
        <span className="font-medium text-sm">
          {saveStatus === 'saving' && 'Saving to database...'}
          {saveStatus === 'success' && 'Successfully saved!'}
          {saveStatus === 'error' && 'Failed to save'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-yellow-300" />
                  <span className="text-sm font-medium">Marks Entry</span>
                </div>
                <h1 className="text-3xl font-bold">Enter Marks</h1>
                <p className="text-blue-100 mt-2">Select class, subject, and exam to enter marks</p>
              </div>
              <div className="flex gap-2">
                <div className={`flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-2`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    dbConnectionStatus === 'connected' ? 'bg-green-400' : 
                    dbConnectionStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-xs">
                    {dbConnectionStatus === 'connected' ? 'DB Connected' : 
                     dbConnectionStatus === 'disconnected' ? 'DB Offline' : 'Checking...'}
                  </span>
                </div>
                <Link to="/my-classes" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition">
                  <School size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Class and Subject Selection */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={!selectedClassId || availableSubjects.length === 0}
              >
                <option value="">Select Subject</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName} ({subject.subjectCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exam Selection */}
        {selectedClassId && selectedSubjectId && (
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Examination</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={loading}
            >
              <option value="">-- Choose an exam --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} - {new Date(exam.examDate).toLocaleDateString()} ({exam.maxMarks} marks)
                </option>
              ))}
            </select>
            
            {error && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
            
            {loading && (
              <div className="mt-4 flex justify-center">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            )}
          </div>
        )}

        {/* Exam Info Card */}
        {examDetails && (
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg border p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Max Marks</p>
                  <p className="text-xl font-bold text-blue-700">{examDetails.maxMarks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Passing Marks</p>
                  <p className="text-xl font-bold text-green-700">{examDetails.passingMarks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Exam Date</p>
                  <p className="text-md font-semibold">{new Date(examDetails.examDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  {examDetails.isLocked ? <Lock size={18} className="text-red-500" /> : <Eye size={18} className="text-green-500" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-md font-semibold ${examDetails.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {examDetails.isLocked ? 'Locked' : 'Open'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode Banner */}
        {isEditMode && !isLocked && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit2 size={20} className="text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Edit Mode Active</h3>
                  <p className="text-sm text-yellow-600">You can now modify marks. Click Save to save changes.</p>
                </div>
              </div>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Locked Exam Message */}
        {isLocked && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={40} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">This exam is locked</h3>
            <p className="text-yellow-600">Marks cannot be edited for locked exams</p>
          </div>
        )}

        {/* Marks Entry Table */}
        {selectedExam && !isLocked && students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-semibold text-green-600">{marksEntered}</span>
                  <span className="text-gray-500"> of </span>
                  <span className="font-semibold">{students.length}</span>
                  <span className="text-gray-500"> students marked</span>
                  {pendingEntries > 0 && (
                    <span className="text-amber-600 ml-2">({pendingEntries} pending)</span>
                  )}
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(marksEntered / students.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditMode && (
                  <button
                    onClick={handleEditMode}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    <Edit2 size={16} />
                    Edit Marks
                  </button>
                )}
                
                {isEditMode && (
                  <>
                    <button onClick={handleMarkAllFull} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition">
                      All Full Marks
                    </button>
                    <button onClick={handleMarkAllPassing} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition">
                      All Passing Marks
                    </button>
                    <button onClick={handleClearAll} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Roll No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Student Name</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Marks / {examDetails?.maxMarks}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => {
                    const isPassing = student.marksObtained !== null && student.marksObtained >= (examDetails?.passingMarks || 0);
                    const isFailing = student.marksObtained !== null && student.marksObtained < (examDetails?.passingMarks || 0);
                    const isDisabled = !isEditMode;
                    
                    return (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {student.rollNumber}
                            </div>
                            <span className="font-mono text-sm text-gray-600">#{student.rollNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-lg">
                                {student.studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">{student.studentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={student.marksObtained || ''}
                              onChange={(e) => handleMarkChange(student.studentId, parseInt(e.target.value) || 0)}
                              className={`w-24 px-3 py-2 text-center border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                                isDisabled ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-200'
                              }`}
                              min="0"
                              max={examDetails?.maxMarks}
                              placeholder="-"
                              disabled={isDisabled}
                            />
                            {isPassing && <CheckCircle size={16} className="text-green-500" />}
                            {isFailing && <XCircle size={16} className="text-red-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={student.remark || ''}
                            onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                            placeholder="Add remark..."
                            className={`w-full max-w-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                              isDisabled ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-200'
                            }`}
                            disabled={isDisabled}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isEditMode && (
              <div className="p-5 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Students Message */}
        {selectedExam && !isLocked && students.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Students Found</h3>
            <p className="text-gray-500">No students are enrolled for this exam</p>
          </div>
        )}
      </div>
      
      <SaveStatusIndicator />
    </div>
  );
};

export default TeacherEnterMarks;