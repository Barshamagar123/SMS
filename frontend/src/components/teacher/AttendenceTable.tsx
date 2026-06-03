// src/components/teacher/AttendanceTable.tsx

import React from 'react';
import { CheckCircle, XCircle, User, Loader2 } from 'lucide-react';

interface Student {
  id: number;
  rollNumber: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | null;
  attendanceId: number | null;
}

interface AttendanceTableProps {
  students: Student[];
  loading: boolean;
  onStatusChange: (studentId: number, status: 'PRESENT' | 'ABSENT') => void;
  onMarkAllPresent: () => void;
  onMarkAllAbsent: () => void;
  presentCount: number;
  absentCount: number;
  notMarkedCount: number;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  students,
  loading,
  onStatusChange,
  onMarkAllPresent,
  onMarkAllAbsent,
  presentCount,
  absentCount,
  notMarkedCount,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
        <User size={64} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No students found</p>
        <p className="text-sm text-gray-400 mt-1">Please ensure students are enrolled in this class</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      {/* Header with quick actions */}
      <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Present: {presentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Absent: {absentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Pending: {notMarkedCount}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllPresent}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
          >
            All Present
          </button>
          <button
            onClick={onMarkAllAbsent}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
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
                      <span className="text-blue-600 font-semibold">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">ID: {student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => onStatusChange(student.id, 'PRESENT')}
                      className={`group relative flex flex-col items-center gap-1 transition-all duration-200 ${
                        student.status === 'PRESENT' ? 'scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                        student.status === 'PRESENT'
                          ? 'bg-green-500 shadow-lg shadow-green-200'
                          : 'bg-gray-100 group-hover:bg-green-100'
                      }`}>
                        <CheckCircle size={20} className={
                          student.status === 'PRESENT'
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-green-600'
                        } />
                      </div>
                      <span className={`text-xs font-medium ${
                        student.status === 'PRESENT' ? 'text-green-600' : 'text-gray-500'
                      }`}>Present</span>
                    </button>
                    <button
                      onClick={() => onStatusChange(student.id, 'ABSENT')}
                      className={`group relative flex flex-col items-center gap-1 transition-all duration-200 ${
                        student.status === 'ABSENT' ? 'scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                        student.status === 'ABSENT'
                          ? 'bg-red-500 shadow-lg shadow-red-200'
                          : 'bg-gray-100 group-hover:bg-red-100'
                      }`}>
                        <XCircle size={20} className={
                          student.status === 'ABSENT'
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-red-600'
                        } />
                      </div>
                      <span className={`text-xs font-medium ${
                        student.status === 'ABSENT' ? 'text-red-600' : 'text-gray-500'
                      }`}>Absent</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};