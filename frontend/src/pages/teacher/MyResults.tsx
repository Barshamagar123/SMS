// src/pages/teacher/MyResults.tsx

import React, { useState, useEffect } from 'react';
import { Award, Eye, Loader2, Sparkles, Lock, Calendar, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamResult {
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

const TeacherMyResults: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const activeYearRes = await fetch('http://localhost:3000/api/teacher-assignments/academic-years/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeYearData = await activeYearRes.json();
      
      if (activeYearData.success && activeYearData.data) {
        const response = await fetch(`http://localhost:3000/api/teacher-assignments/my-results-summary?academicYearId=${activeYearData.data.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data?.results || []);
        } else {
          toast.error(data.message || 'Failed to load results');
        }
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-sm font-medium">Results</span>
          </div>
          <h1 className="text-3xl font-bold">My Results</h1>
          <p className="text-blue-100 mt-2">View performance summary of your exams</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
          <Award size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No exam results available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <div key={result.examId} className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition">
              <div className={`p-5 text-white ${result.isLocked ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{result.examName}</h3>
                    <p className="text-sm opacity-90">{result.className}</p>
                    <p className="text-xs opacity-75 mt-1">{result.subjectName}</p>
                  </div>
                  {result.isLocked ? <Lock size={18} /> : <Award size={18} />}
                </div>
              </div>
              <div className="p-5 space-y-3">
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
                  onClick={() => {
                    setSelectedResult(result);
                    setShowModal(true);
                  }}
                  className="w-full mt-3 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
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