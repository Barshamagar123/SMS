// src/pages/teacher/EnterMarks.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Save, Loader2, Lock, CheckCircle, AlertCircle,
  School, BookOpen, Calendar, Sparkles, TrendingUp, Users, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const className = searchParams.get('className') || 'Class';
  const subjectName = searchParams.get('subjectName') || 'Subject';

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [examDetails, setExamDetails] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  useEffect(() => {
    fetchActiveAcademicYear();
  }, []);

  useEffect(() => {
    if (academicYearId) {
      fetchExams();
    }
  }, [academicYearId]);

  useEffect(() => {
    if (selectedExam) {
      fetchStudents();
    }
  }, [selectedExam]);

  // FETCH ACTIVE ACADEMIC YEAR
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

  // FETCH EXAMS FROM BACKEND
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/teacher/my-exams?academicYearId=${academicYearId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('Exams API Response:', data);
      
      if (data.success && data.data) {
        // Filter exams for this class and subject
        const filteredExams = data.data.filter(
          (exam: Exam) => exam.classId.toString() === classId && exam.subjectId.toString() === subjectId
        );
        setExams(filteredExams);
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

  // FETCH STUDENTS FOR MARKS ENTRY
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('Students API Response:', data);
      
      if (data.success && data.data) {
        setStudents(data.data);
        const exam = exams.find(e => e.id.toString() === selectedExam);
        setExamDetails(exam || null);
      } else {
        toast.error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: number, marks: number) => {
    if (examDetails && marks > examDetails.maxMarks) {
      toast.error(`Marks cannot exceed ${examDetails.maxMarks}`);
      return;
    }
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, marksObtained: marks } : s
    ));
  };

  const handleRemarkChange = (studentId: number, remark: string) => {
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, remark } : s
    ));
  };

  const handleMarkAllFull = () => {
    if (!examDetails) return;
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: examDetails.maxMarks })));
    toast.success(`All students marked with full marks (${examDetails.maxMarks})`);
  };

  const handleMarkAllPassing = () => {
    if (!examDetails) return;
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: examDetails.passingMarks })));
    toast.success(`All students marked with passing marks (${examDetails.passingMarks})`);
  };

  const handleClearAll = () => {
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: null })));
    toast.success('All marks cleared');
  };

  // SAVE MARKS TO BACKEND
  const handleSave = async () => {
    const marksData = students.map(s => ({
      studentId: s.studentId,
      marksObtained: s.marksObtained || 0,
      remark: s.remark
    }));

    setSaving(true);
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
      
      if (data.success) {
        toast.success('Marks saved successfully');
        await fetchStudents();
      } else {
        toast.error(data.message || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Failed to save marks:', error);
      toast.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const marksEntered = students.filter(s => s.marksObtained !== null).length;
  const pendingEntries = students.length - marksEntered;
  const isLocked = examDetails?.isLocked;

  if (loading && exams.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-yellow-300" />
          <span className="text-sm font-medium">Marks Entry</span>
        </div>
        <h1 className="text-2xl font-bold">Enter Marks</h1>
        <p className="text-blue-100 mt-1">{className} - {subjectName}</p>
        <div className="flex gap-3 mt-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Class: {className}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Subject: {subjectName}</span>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Choose an exam --</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name} ({exam.examType}) - {new Date(exam.examDate).toLocaleDateString()}
            </option>
          ))}
        </select>
        {exams.length === 0 && !loading && (
          <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle size={14} />
            No exams found for this class and subject
          </p>
        )}
      </div>

      {/* Exam Info */}
      {examDetails && !isLocked && (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Award size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Max Marks</p>
              <p className="font-semibold">{examDetails.maxMarks}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Passing Marks</p>
              <p className="font-semibold">{examDetails.passingMarks}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Exam Date</p>
              <p className="font-semibold">{new Date(examDetails.examDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Locked Exam Message */}
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Lock size={48} className="mx-auto text-yellow-500 mb-3" />
          <p className="text-yellow-800 font-semibold">This exam is locked</p>
          <p className="text-yellow-600 text-sm mt-1">Marks cannot be edited for locked exams</p>
        </div>
      )}

      {/* Marks Entry Table */}
      {!selectedExam && !loading && (
        <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Select an exam to enter marks</p>
        </div>
      )}

      {selectedExam && !isLocked && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header with quick actions */}
          <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center flex-wrap gap-3">
            <div className="text-sm">
              <span className="font-medium">{marksEntered}</span> of <span className="font-medium">{students.length}</span> students marked
              {pendingEntries > 0 && <span className="text-amber-600 ml-2">({pendingEntries} pending)</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleMarkAllFull} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                All Full Marks
              </button>
              <button onClick={handleMarkAllPassing} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                All Passing Marks
              </button>
              <button onClick={handleClearAll} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                Clear All
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Marks / {examDetails?.maxMarks}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">#{student.rollNumber}</td>
                    <td className="px-4 py-3 font-medium">{student.studentName}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={student.marksObtained || ''}
                        onChange={(e) => handleMarkChange(student.studentId, parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 text-center border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={examDetails?.maxMarks}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.remark || ''}
                        onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                        placeholder="Optional"
                        className="w-full max-w-xs px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save All Marks'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherEnterMarks;