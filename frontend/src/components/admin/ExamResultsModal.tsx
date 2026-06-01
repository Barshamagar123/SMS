import React from 'react';
import { X, Award, TrendingUp, Users, CheckCircle, XCircle, Crown, Medal, AlertCircle } from 'lucide-react';

interface Exam {
  id: number;
  name: string;
  class?: { displayName: string };
  subject?: { name: string; code: string };
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
  examType?: { name: string };
}

interface ExamResult {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number;
  percentage: number;
  grade: string;
  remark?: string;
  rank: number;
}

interface ExamAnalytics {
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
}

interface ExamResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  results: ExamResult[];
  analytics: ExamAnalytics | null;
}

const ExamResultsModal: React.FC<ExamResultsModalProps> = ({ 
  isOpen, onClose, exam, results, analytics 
}) => {
  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={18} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={18} className="text-gray-400" />;
    if (rank === 3) return <Medal size={18} className="text-orange-500" />;
    return null;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-700';
      case 'A': return 'bg-blue-100 text-blue-700';
      case 'B': return 'bg-yellow-100 text-yellow-700';
      case 'C': return 'bg-orange-100 text-orange-700';
      case 'D': return 'bg-purple-100 text-purple-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Exam Results</h2>
              <p className="text-blue-100 text-sm">
                {exam.name} - {exam.class?.displayName || 'N/A'} - {exam.subject?.name || 'N/A'}
              </p>
              <p className="text-blue-100 text-xs mt-1">
                Exam Date: {new Date(exam.examDate).toLocaleDateString()} | Max Marks: {exam.maxMarks} | Passing: {exam.passingMarks}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* No Results Message */}
          {results.length === 0 && (
            <div className="text-center py-10 bg-yellow-50 rounded-xl border border-yellow-200">
              <AlertCircle size={48} className="mx-auto text-yellow-500 mb-3" />
              <p className="text-yellow-800 font-medium">No Results Available Yet</p>
              <p className="text-yellow-600 text-sm mt-1">
                Marks have not been entered for this exam yet.
              </p>
              <p className="text-yellow-500 text-xs mt-2">
                Teachers need to enter marks first. Then results will appear here.
              </p>
            </div>
          )}

          {/* Analytics Cards - Only show if there are results */}
          {analytics && results.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-600" />
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-600" />
                    <p className="text-xs text-gray-500">Average Marks</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{analytics.averageMarks}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-purple-600" />
                    <p className="text-xs text-gray-500">Pass Percentage</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{analytics.passPercentage}%</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-yellow-600" />
                    <p className="text-xs text-gray-500">Highest Marks</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.highestMarks}</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm">Pass: <strong>{analytics.passCount}</strong> students</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <span className="text-sm">Fail: <strong>{analytics.failCount}</strong> students</span>
                </div>
              </div>
            </>
          )}

          {/* Results Table - Only show if there are results */}
          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Marks</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.studentId} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getRankIcon(result.rank)}
                          <span className={`font-bold ${result.rank === 1 ? 'text-yellow-600' : result.rank === 2 ? 'text-gray-500' : result.rank === 3 ? 'text-orange-500' : 'text-gray-600'}`}>
                            #{result.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{result.rollNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">{result.studentName}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${result.marksObtained >= exam.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                          {result.marksObtained}/{exam.maxMarks}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{result.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResultsModal;