// src/pages/teacher/EnterMarks.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Save, Loader2, Lock, CheckCircle, AlertCircle, 
  TrendingUp, Users, Award, Calendar, BookOpen, 
  Eye, EyeOff, CheckSquare, XSquare, Edit3
} from 'lucide-react';
import { useTeacherExams, useMarksEntryStudents, useSaveMarks, useActiveAcademicYear } from '../../hooks/useTeacherData';
import toast from 'react-hot-toast';

const TeacherEnterMarks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const className = searchParams.get('className') || 'Class';
  const subjectName = searchParams.get('subjectName') || 'Subject';

  const { activeYear } = useActiveAcademicYear();
  const { exams, loading: examsLoading } = useTeacherExams(activeYear?.id);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const { students, setStudents, loading: studentsLoading, examDetails } = useMarksEntryStudents(
    selectedExam ? parseInt(selectedExam) : null
  );
  const { saveMarks, saving } = useSaveMarks();
  const [showStats, setShowStats] = useState(true);

  const filteredExams = exams.filter(
    (e) => e.classId.toString() === classId && e.subjectId.toString() === subjectId
  );

  const handleMarkChange = (studentId: number, marks: number) => {
    if (examDetails && marks > examDetails.maxMarks) {
      toast.error(`Marks cannot exceed ${examDetails.maxMarks}`);
      return;
    }
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, marksObtained: marks } : s
    ));
  };

  const handleMarkAll = (marks: number) => {
    if (examDetails && marks > examDetails.maxMarks) {
      toast.error(`Marks cannot exceed ${examDetails.maxMarks}`);
      return;
    }
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: marks })));
    toast.success(`All students marked with ${marks} marks`);
  };

  const handleSave = async () => {
    const marksData = students.map(s => ({
      studentId: s.studentId,
      marksObtained: s.marksObtained || 0,
      remark: s.remark
    }));
    await saveMarks(parseInt(selectedExam), marksData);
  };

  const isLocked = examDetails?.isLocked;
  
  const statistics = {
    totalStudents: students.length,
    marksEntered: students.filter(s => s.marksObtained !== null && s.marksObtained !== undefined).length,
    pendingEntries: students.filter(s => s.marksObtained === null || s.marksObtained === undefined).length,
    averageMarks: students.length > 0 
      ? (students.reduce((sum, s) => sum + (s.marksObtained || 0), 0) / students.length).toFixed(1)
      : 0,
    highestMarks: students.length > 0 
      ? Math.max(...students.map(s => s.marksObtained || 0))
      : 0,
    lowestMarks: students.length > 0 
      ? Math.min(...students.map(s => s.marksObtained || 0))
      : 0,
  };

  const selectedExamData = filteredExams.find(e => e.id.toString() === selectedExam);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Enter Marks</h1>
            <p className="text-blue-100 mt-1">
              {className} - {subjectName}
            </p>
            <div className="flex items-center gap-3 mt-3 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <BookOpen size={14} />
                {filteredExams.length} Exams Available
              </span>
              {selectedExamData && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(selectedExamData.examDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={14} />
                    Max: {selectedExamData.maxMarks}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Exam Selection Card */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
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
              {filteredExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.examType}) - {new Date(exam.examDate).toLocaleDateString()}
                </option>
              ))}
            </select>
            {filteredExams.length === 0 && !examsLoading && (
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
                  {isLocked ? <Lock size={16} className="text-red-500" /> : <Edit3 size={16} className="text-green-500" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`font-semibold ${isLocked ? 'text-red-600' : 'text-green-600'}`}>
                    {isLocked ? 'Locked' : 'Open for Entry'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedExam && !isLocked && students.length > 0 && showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{statistics.totalStudents}</p>
              </div>
              <Users size={20} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Marks Entered</p>
                <p className="text-2xl font-bold text-green-700">{statistics.marksEntered}</p>
              </div>
              <CheckSquare size={20} className="text-green-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{statistics.pendingEntries}</p>
              </div>
              <XSquare size={20} className="text-yellow-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Average</p>
                <p className="text-2xl font-bold text-purple-700">{statistics.averageMarks}</p>
              </div>
              <TrendingUp size={20} className="text-purple-500" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Highest</p>
                <p className="text-2xl font-bold text-orange-700">{statistics.highestMarks}</p>
              </div>
              <Award size={20} className="text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedExam && !isLocked && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quick Actions:</span>
              <button
                onClick={() => handleMarkAll(examDetails?.maxMarks || 0)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
              >
                All Full Marks
              </button>
              <button
                onClick={() => handleMarkAll(examDetails?.passingMarks || 0)}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition"
              >
                All Passing Marks
              </button>
              <button
                onClick={() => handleMarkAll(0)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
              >
                All Zero
              </button>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-1"
            >
              {showStats ? <EyeOff size={14} /> : <Eye size={14} />}
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>
      )}

      {/* Loading States */}
      {(examsLoading || studentsLoading) && (
        <div className="flex justify-center py-20 bg-white rounded-xl">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* No Exam Selected */}
      {!selectedExam && !examsLoading && !studentsLoading && (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Select an exam to enter marks</p>
          <p className="text-gray-400 text-sm mt-1">Choose an exam from the dropdown above</p>
        </div>
      )}

      {/* Locked Exam Message */}
      {selectedExam && isLocked && (
        <div className="text-center py-20 bg-yellow-50 rounded-xl border-2 border-yellow-200">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-yellow-600" />
          </div>
          <p className="text-yellow-800 text-lg">This exam is locked</p>
          <p className="text-yellow-600 text-sm mt-1">Marks cannot be edited for locked exams</p>
          <p className="text-yellow-500 text-xs mt-2">Contact administrator to unlock if needed</p>
        </div>
      )}

      {/* Students Table */}
      {selectedExam && !isLocked && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Marks / {examDetails?.maxMarks}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm font-medium text-gray-600">#{student.rollNumber}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {student.studentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{student.studentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={student.marksObtained || ''}
                          onChange={(e) => handleMarkChange(student.studentId, parseInt(e.target.value) || 0)}
                          className="w-28 px-3 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          min="0"
                          max={examDetails?.maxMarks}
                          placeholder="-"
                        />
                        <span className="text-xs text-gray-400">/ {examDetails?.maxMarks}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={student.remark || ''}
                        onChange={(e) => setStudents(prev => prev.map(s => 
                          s.studentId === student.studentId ? { ...s, remark: e.target.value } : s
                        ))}
                        placeholder="Add remark..."
                        className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{statistics.marksEntered}</span> of <span className="font-medium">{statistics.totalStudents}</span> students marked
              {statistics.pendingEntries > 0 && (
                <span className="text-amber-600 ml-2">({statistics.pendingEntries} pending)</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all entered marks?')) {
                    setStudents(prev => prev.map(s => ({ ...s, marksObtained: null })));
                    toast.success('All marks cleared');
                  }
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherEnterMarks;