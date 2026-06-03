// src/pages/teacher/MyResults.tsx

import React, { useState } from 'react';
import { Award, TrendingUp, Users, CheckCircle, XCircle, Eye, Loader2, Calendar, Lock } from 'lucide-react';
import { useTeacherResultsSummary } from '../../hooks/useTeacherData';
import type { ExamResultsSummary } from '../../types/teacher';

const TeacherMyResults: React.FC = () => {
  const { results, loading } = useTeacherResultsSummary();
  const [selectedResult, setSelectedResult] = useState<ExamResultsSummary | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (result: ExamResultsSummary) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const ResultModal = () => {
    if (!selectedResult) return null;
    const stats = selectedResult.statistics;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedResult.examName}</h2>
                <p className="text-blue-100 text-sm">{selectedResult.className} - {selectedResult.subjectName}</p>
                <p className="text-blue-100 text-xs mt-1">
                  <Calendar size={12} className="inline mr-1" />
                  {new Date(selectedResult.examDate).toLocaleDateString()}
                  {selectedResult.isLocked && <Lock size={12} className="inline ml-2" />}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg">✕</button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Users size={20} className="mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <TrendingUp size={20} className="mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-500">Pass %</p>
                <p className="text-xl font-bold text-green-600">{stats.passPercentage}%</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <Award size={20} className="mx-auto text-yellow-600 mb-1" />
                <p className="text-xs text-gray-500">Average Marks</p>
                <p className="text-xl font-bold">{stats.averageMarks}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Award size={20} className="mx-auto text-purple-600 mb-1" />
                <p className="text-xs text-gray-500">Highest Marks</p>
                <p className="text-xl font-bold">{stats.highestMarks}</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span>Pass: <strong>{stats.passedStudents}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                <span>Fail: <strong>{stats.failedStudents}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
        <p className="text-gray-500 text-sm mt-1">View performance summary of your exams</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Award size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No exam results available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <div key={result.examId} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              <div className={`p-4 text-white ${result.isLocked ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{result.examName}</h3>
                    <p className="text-sm opacity-90">{result.className}</p>
                    <p className="text-xs opacity-75 mt-1">{result.subjectName}</p>
                  </div>
                  {result.isLocked ? <Lock size={16} /> : <Award size={16} />}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pass Percentage</span>
                  <span className="text-lg font-bold text-green-600">{result.statistics.passPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Average Marks</span>
                  <span className="text-lg font-bold text-blue-600">{result.statistics.averageMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Highest Marks</span>
                  <span className="text-lg font-bold text-purple-600">{result.statistics.highestMarks}</span>
                </div>
                <button
                  onClick={() => handleViewDetails(result)}
                  className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ResultModal />}
    </div>
  );
};

export default TeacherMyResults;