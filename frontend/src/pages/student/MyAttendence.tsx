// src/pages/student/MyAttendance.tsx

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useStudentAttendance } from '../../hooks/useStudentAttendance';
import { getStatusBadge, getStatusText } from '../../utils/studentHelpers';

const MyAttendance: React.FC = () => {
  const { attendance, loading } = useStudentAttendance();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const previousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const filteredAttendance = attendance?.recentAttendance.filter(record => {
    const date = new Date(record.date);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  }) || [];

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
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 mt-1">Track your daily attendance record</p>
      </div>

      {attendance?.alert?.show && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-yellow-600" size={20} />
          <p className="text-sm text-yellow-800">{attendance.alert.message}</p>
        </div>
      )}

      {attendance?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-sm">Total Days</p>
            <p className="text-2xl font-bold mt-2">{attendance.summary.totalDays}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-sm">Present</p>
            <p className="text-2xl font-bold mt-2">{attendance.summary.presentDays}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-red-100 text-sm">Absent</p>
            <p className="text-2xl font-bold mt-2">{attendance.summary.absentDays}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-sm">Percentage</p>
            <p className="text-2xl font-bold mt-2">{attendance.summary.percentage.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-gray-500" />
            <span className="font-semibold text-gray-700">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record, index) => {
                  const date = new Date(record.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800">{date.toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dayName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.remark || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;