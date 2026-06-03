// src/pages/teacher/MarkAttendance.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, CheckCircle, XCircle, Save, Loader2, RefreshCw,
  Users, TrendingUp, Clock, Sparkles, School, AlertCircle,
  ChevronLeft, ChevronRight, UserCheck, UserX
} from 'lucide-react';
import { useAttendanceStudents, useSaveAttendance } from '../../hooks/useTeacherData';
import toast from 'react-hot-toast';

const TeacherMarkAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const className = searchParams.get('className') || 'Class';
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const { students, setStudents, loading, markedCount, setMarkedCount } = useAttendanceStudents(
    classId ? parseInt(classId) : null, 
    selectedDate
  );
  const { saveAttendance, saving } = useSaveAttendance();

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    const oldStatus = students.find(s => s.id === studentId)?.status;
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status } : s
    ));
    
    if (oldStatus === null && status !== null) {
      setMarkedCount(prev => prev + 1);
    } else if (oldStatus !== null && status === null) {
      setMarkedCount(prev => prev - 1);
    }
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    const allCount = students.length;
    setMarkedCount(status === 'PRESENT' ? allCount : allCount);
    toast.success(`All students marked as ${status.toLowerCase()}`);
  };

  const handleSave = async () => {
    if (markedCount === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }
    
    const attendances = students.map(s => ({
      studentId: s.id,
      status: s.status || 'ABSENT'
    }));

    await saveAttendance(parseInt(classId!), selectedDate, attendances);
  };

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const notMarkedCount = students.length - presentCount - absentCount;
  const completionPercentage = students.length > 0 ? (markedCount / students.length) * 100 : 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Animated Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-sm font-medium">Attendance Management</span>
              </div>
              <h1 className="text-3xl font-bold">Mark Attendance</h1>
              <p className="text-blue-100 mt-2">{className}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                  <School size={14} />
                  <span>Class ID: {classId}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
                  <Calendar size={14} />
                  <span>{formatDate(selectedDate)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full p-3">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Date and Quick Actions Card */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200 transition-all duration-200"
            >
              <UserCheck size={16} />
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-all duration-200"
            >
              <UserX size={16} />
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-700">{students.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{absentCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-purple-700">{completionPercentage.toFixed(0)}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp size={18} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progress Alert */}
      {notMarkedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{notMarkedCount}</span> student(s) pending. Please mark attendance for all students.
          </p>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading students...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
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
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`group relative flex flex-col items-center gap-1 transition-all duration-200 ${
                            student.status === 'PRESENT'
                              ? 'scale-105'
                              : 'opacity-60 hover:opacity-100'
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
                            student.status === 'PRESENT'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}>
                            Present
                          </span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`group relative flex flex-col items-center gap-1 transition-all duration-200 ${
                            student.status === 'ABSENT'
                              ? 'scale-105'
                              : 'opacity-60 hover:opacity-100'
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
                            student.status === 'ABSENT'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                            Absent
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-4">
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
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving Attendance...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarkAttendance;