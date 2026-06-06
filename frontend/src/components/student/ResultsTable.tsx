// src/components/student/ResultsTable.tsx

import React from 'react';
import type { ExamResult } from '../../types/student';
import { getPerformanceColor, getGradeColor, formatDate } from '../../utils/studentHelpers';

interface ResultsTableProps {
  results: ExamResult[];
  loading?: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading results...</div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No results available</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marks</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((result, index) => (
            <tr key={index} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-800">{result.examName}</p>
                <p className="text-xs text-gray-500">{result.examType}</p>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{result.subject}</td>
              <td className="px-6 py-4 text-center text-sm text-gray-500">
                {formatDate(result.examDate)}
              </td>
              <td className="px-6 py-4 text-center text-sm font-medium">
                {result.marksObtained} / {result.maxMarks}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(result.percentage)}`}>
                  {result.percentage.toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                  {result.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;