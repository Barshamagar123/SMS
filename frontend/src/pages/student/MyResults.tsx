// src/pages/student/MyResults.tsx

import React, { useState } from 'react';
import { Filter, Loader2 } from 'lucide-react';
import { useStudentResults } from '../../hooks/useStudentResults';
import ResultsTable from '../../components/student/ResultsTable';

const MyResults: React.FC = () => {
  const { results, loading } = useStudentResults();
  const [selectedExamType, setSelectedExamType] = useState<string>('all');

  const examTypes = ['all', ...new Set(results.map(r => r.examType))];
  const filteredResults = selectedExamType === 'all' 
    ? results 
    : results.filter(r => r.examType === selectedExamType);

  const totalMarks = filteredResults.reduce((sum, r) => sum + r.maxMarks, 0);
  const obtainedMarks = filteredResults.reduce((sum, r) => sum + r.marksObtained, 0);
  const overallPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Results</h1>
        <p className="text-gray-500 mt-1">View your academic performance across all exams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm">Total Exams</p>
          <p className="text-3xl font-bold mt-2">{filteredResults.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm">Overall Percentage</p>
          <p className="text-3xl font-bold mt-2">{overallPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm">Total Marks</p>
          <p className="text-3xl font-bold mt-2">{obtainedMarks} / {totalMarks}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-gray-500" />
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {examTypes.map((type) => (
              <option key={type} value={type}>{type === 'all' ? 'All Exam Types' : type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <ResultsTable results={filteredResults} loading={loading} />
      </div>
    </div>
  );
};

export default MyResults;