// src/components/teacher/MarksEntryTable.tsx

import React from 'react';
import { Save, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface MarksEntryStudent {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number | null;
  remark?: string;
}

interface MarksEntryTableProps {
  students: MarksEntryStudent[];
  loading: boolean;
  examDetails: {
    maxMarks: number;
    passingMarks: number;
    isLocked: boolean;
    name: string;
  } | null;
  onMarkChange: (studentId: number, marks: number) => void;
  onRemarkChange: (studentId: number, remark: string) => void;
  onSave: () => void;
  saving: boolean;
  onMarkAllFull: () => void;
  onMarkAllPassing: () => void;
  onClearAll: () => void;
}

export const MarksEntryTable: React.FC<MarksEntryTableProps> = ({
  students,
  loading,
  examDetails,
  onMarkChange,
  onRemarkChange,
  onSave,
  saving,
  onMarkAllFull,
  onMarkAllPassing,
  onClearAll,
}) => {
  const marksEntered = students.filter(s => s.marksObtained !== null && s.marksObtained !== undefined).length;
  const pendingEntries = students.length - marksEntered;

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!examDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
        <AlertCircle size={64} className="mx-auto text-yellow-500 mb-4" />
        <p className="text-gray-500 text-lg">Select an exam to enter marks</p>
      </div>
    );
  }

  if (examDetails.isLocked) {
    return (
      <div className="bg-yellow-50 rounded-2xl shadow-lg border border-yellow-200 p-16 text-center">
        <Lock size={64} className="mx-auto text-yellow-500 mb-4" />
        <p className="text-yellow-800 text-lg">This exam is locked</p>
        <p className="text-yellow-600 text-sm mt-1">Marks cannot be edited for locked exams</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      {/* Header with exam info */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">{examDetails.name}</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Max Marks: <strong>{examDetails.maxMarks}</strong></span>
            <span className="text-gray-600">Passing: <strong>{examDetails.passingMarks}</strong></span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{marksEntered}</span> of <span className="font-medium">{students.length}</span> students marked
            {pendingEntries > 0 && <span className="text-amber-600 ml-2">({pendingEntries} pending)</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onMarkAllFull}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
            >
              All Full Marks
            </button>
            <button
              onClick={onMarkAllPassing}
              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition"
            >
              All Passing Marks
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Marks / {examDetails.maxMarks}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const isPassing = student.marksObtained !== null && student.marksObtained >= examDetails.passingMarks;
              const isFailing = student.marksObtained !== null && student.marksObtained < examDetails.passingMarks;
              
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
                        onChange={(e) => onMarkChange(student.studentId, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        min="0"
                        max={examDetails.maxMarks}
                      />
                      {isPassing && <CheckCircle size={16} className="text-green-500" />}
                      {isFailing && <XCircle size={16} className="text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={student.remark || ''}
                      onChange={(e) => onRemarkChange(student.studentId, e.target.value)}
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
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All Marks'}
        </button>
      </div>
    </div>
  );
};

// Add missing Lock import at top
import { Lock } from 'lucide-react';