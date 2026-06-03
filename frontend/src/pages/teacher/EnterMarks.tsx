// src/pages/teacher/EnterMarks.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Sparkles, School, BookOpen, 
  Calendar, AlertCircle, Loader2, Lock, CheckCircle, XCircle, Save
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

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchStudents();
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const activeYearRes = await fetch('http://localhost:3000/api/teacher-assignments/academic-years/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeYearData = await activeYearRes.json();
      
      if (activeYearData.success && activeYearData.data) {
        const response = await fetch(`http://localhost:3000/api/exams/teacher/my-exams?academicYearId=${activeYearData.data.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          const filteredExams = data.data.filter((e: any) => 
            e.classId.toString() === classId && e.subjectId.toString() === subjectId
          );
          setExams(filteredExams);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${selectedExam}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data || []);
        const exam = exams.find(e => e.id.toString() === selectedExam);
        setExamDetails(exam || null);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
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

  const marksEntered = students.filter(s => s.marksObtained !== null && s.marksObtained !== undefined).length;
  const pendingEntries = students.length - marksEntered;

  if (loading && exams.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-sm font-medium">Marks Entry</span>
              </div>
              <h1 className="text-3xl font-bold">Enter Marks</h1>
              <p className="text-blue-100 mt-2">{className} - {subjectName}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                  <School size={14} />
                  <span>Class: {className}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                  <BookOpen size={14} />
                  <span>Subject: {subjectName}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full p-3">
              <FileText size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Examination
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white"
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
          
          {examDetails && (
            <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-xl">
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
                  {examDetails.isLocked ? <Lock size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-green-500" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`font-semibold ${examDetails.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {examDetails.isLocked ? 'Locked' : 'Open for Entry'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marks Entry Section */}
      {!selectedExam ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Select an exam to enter marks</p>
          <p className="text-gray-400 text-sm mt-1">Choose an exam from the dropdown above</p>
        </div>
      ) : examDetails?.isLocked ? (
        <div className="text-center py-20 bg-yellow-50 rounded-2xl shadow-lg border-2 border-yellow-200">
          <Lock size={64} className="mx-auto text-yellow-500 mb-4" />
          <p className="text-yellow-800 text-lg">This exam is locked</p>
          <p className="text-yellow-600 text-sm mt-1">Marks cannot be edited for locked exams</p>
          <p className="text-yellow-500 text-xs mt-2">Contact administrator to unlock if needed</p>
        </div>
      ) : loading && selectedExam ? (
        <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
          <Loader2 size={48} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          {/* Header with quick actions */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{marksEntered}</span> of <span className="font-medium">{students.length}</span> students marked
                {pendingEntries > 0 && <span className="text-amber-600 ml-2">({pendingEntries} pending)</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkAllFull}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
                >
                  All Full Marks
                </button>
                <button
                  onClick={handleMarkAllPassing}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition"
                >
                  All Passing Marks
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Marks / {examDetails?.maxMarks}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const isPassing = student.marksObtained !== null && student.marksObtained >= (examDetails?.passingMarks || 0);
                  const isFailing = student.marksObtained !== null && student.marksObtained < (examDetails?.passingMarks || 0);
                  
                  return (
                    <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">#{student.rollNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {student.studentName.charAt(0).toUpperCase()}
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
                            className="w-24 px-3 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            min="0"
                            max={examDetails?.maxMarks}
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
                          placeholder="Optional remark"
                          className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-5 border-t bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
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

// Add missing import for Award
import { Award } from 'lucide-react';

export default TeacherEnterMarks;