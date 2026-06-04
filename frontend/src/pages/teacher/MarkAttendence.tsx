// src/pages/teacher/MarkAttendance.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle, XCircle, Save, Loader2, 
  RefreshCw, Users, School, TrendingUp, Clock,
  Sparkles, AlertCircle, UserCheck, UserX, ChevronLeft,
  Edit, Check, Lock, PenSquare, Eye, XCircle as XCircleIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherMarkAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const className = searchParams.get('className') || 'Class';
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [greeting, setGreeting] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [attendanceExists, setAttendanceExists] = useState(false);
  const [editChanges, setEditChanges] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (classId) {
      loadStudents();
    }
  }, [classId, selectedDate]);

  const loadStudents = async () => {
    setLoading(true);
    setIsEditMode(false);
    setEditChanges(new Map());
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:3000/api/attendance/class/${classId}/students?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('DATA:', data);
      
      if (data.success && data.data && data.data.students) {
        setStudents(data.data.students);
        const hasAttendance = data.data.students.some((s: any) => s.status !== null);
        setAttendanceExists(hasAttendance);
      } else {
        setStudents([]);
        setAttendanceExists(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (studentId: number, status: string) => {
    if (!isEditMode) {
      toast.error('Please click "Edit Mode" to make changes');
      return;
    }
    
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status } : s
    ));
    
    setEditChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  const handleMarkAllPresent = () => {
    if (!isEditMode) {
      toast.error('Please click "Edit Mode" to make changes');
      return;
    }
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
    students.forEach(s => {
      setEditChanges(prev => {
        const newMap = new Map(prev);
        newMap.set(s.id, 'PRESENT');
        return newMap;
      });
    });
    toast.success(`All ${students.length} students marked as present`);
  };

  const handleMarkAllAbsent = () => {
    if (!isEditMode) {
      toast.error('Please click "Edit Mode" to make changes');
      return;
    }
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: 'ABSENT' })));
    students.forEach(s => {
      setEditChanges(prev => {
        const newMap = new Map(prev);
        newMap.set(s.id, 'ABSENT');
        return newMap;
      });
    });
    toast.success(`All ${students.length} students marked as absent`);
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    toast.success('Edit mode enabled. Make your changes and click "Save Changes".');
  };

  const handleCancelEdit = () => {
    loadStudents();
    setIsEditMode(false);
    setEditChanges(new Map());
    toast.success('Edit mode cancelled. No changes were saved.');
  };

  const saveAttendance = async () => {
    if (!isEditMode) {
      toast.error('Please click "Edit Mode" to make changes');
      return;
    }
    
    if (students.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }
    
    if (editChanges.size === 0 && attendanceExists) {
      toast.error('No changes detected. Please make changes before saving.');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const attendances = students.map(s => ({
        studentId: s.id,
        status: s.status || 'ABSENT'
      }));
      
      const response = await fetch(`http://localhost:3000/api/attendance/class/${classId}/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: selectedDate, attendances })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(attendanceExists ? 'Attendance updated successfully!' : 'Attendance saved successfully!');
        setIsEditMode(false);
        setEditChanges(new Map());
        loadStudents();
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const notMarkedCount = students.length - presentCount - absentCount;
  const completionPercentage = students.length > 0 ? ((presentCount + absentCount) / students.length) * 100 : 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="relative">
            <Loader2 size={60} className="animate-spin text-blue-500 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <School size={24} className="text-blue-300" />
            </div>
          </div>
          <p className="text-gray-500 mt-4">Loading students...</p>
        </div>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h2>
          <p className="text-gray-500">No students are enrolled in {className}</p>
          <Link to="/my-classes" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ChevronLeft size={16} /> Back to My Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-yellow-300" />
                  <span className="text-sm font-medium">{greeting}!</span>
                </div>
                <h1 className="text-3xl font-bold">Mark Attendance</h1>
                <p className="text-blue-100 mt-2">{className}</p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <School size={14} />
                    <span className="text-sm">Class ID: {classId}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Calendar size={14} />
                    <span className="text-sm">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Users size={14} />
                    <span className="text-sm">{students.length} Students</span>
                  </div>
                  {attendanceExists && (
                    <div className="flex items-center gap-2 bg-yellow-400/30 px-3 py-1.5 rounded-full">
                      <Lock size={14} />
                      <span className="text-sm">Previously Marked</span>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="flex items-center gap-2 bg-green-400/30 px-3 py-1.5 rounded-full">
                      <Edit size={14} />
                      <span className="text-sm">Edit Mode Active</span>
                    </div>
                  )}
                </div>
              </div>
              <Link to="/my-classes" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <School size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-5">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isEditMode}
                />
              </div>
              <button
                onClick={loadStudents}
                className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh"
                disabled={isEditMode}
              >
                <RefreshCw size={18} />
              </button>
            </div>
            
            {/* Edit Mode Toggle Buttons */}
            <div className="flex gap-3">
              {!isEditMode ? (
                <button
                  onClick={handleEnterEditMode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-all duration-200"
                >
                  <PenSquare size={16} />
                  Edit Mode
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    <XCircleIcon size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-blue-700">{students.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-3xl font-bold text-green-700">{presentCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={22} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-3xl font-bold text-red-700">{absentCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={22} className="text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion</p>
                <p className="text-3xl font-bold text-purple-700">{completionPercentage.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp size={22} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Edit Mode Info Alert */}
        {!isEditMode && attendanceExists && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Eye size={20} className="text-blue-600" />
            <p className="text-sm text-blue-800">
              Attendance already recorded for this date. Click <strong>"Edit Mode"</strong> to make changes.
            </p>
          </div>
        )}

        {isEditMode && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Edit size={20} className="text-green-600" />
            <p className="text-sm text-green-800">
              <strong>Edit Mode Active</strong> - You can now change attendance status. Click <strong>"Save Changes"</strong> when done.
            </p>
          </div>
        )}

        {/* Alert for pending marks */}
        {!attendanceExists && notMarkedCount > 0 && !isEditMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">{notMarkedCount}</span> student(s) pending. 
              Click <strong>"Edit Mode"</strong> to mark attendance.
            </p>
          </div>
        )}

        {/* Students Table */}
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
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {student.rollNumber}
                        </div>
                        <span className="font-mono text-sm text-gray-600">#{student.rollNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
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
                          onClick={() => updateStatus(student.id, 'PRESENT')}
                          disabled={!isEditMode}
                          className={`group flex flex-col items-center gap-1 transition-all duration-200 ${
                            student.status === 'PRESENT' ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          } ${!isEditMode ? 'cursor-not-allowed opacity-50' : ''}`}
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
                          }`}>
                            Present
                          </span>
                        </button>
                        <button
                          onClick={() => updateStatus(student.id, 'ABSENT')}
                          disabled={!isEditMode}
                          className={`group flex flex-col items-center gap-1 transition-all duration-200 ${
                            student.status === 'ABSENT' ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          } ${!isEditMode ? 'cursor-not-allowed opacity-50' : ''}`}
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

          {/* Footer */}
          <div className="p-5 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Present: <strong className="text-green-600">{presentCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Absent: <strong className="text-red-600">{absentCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending: <strong className="text-yellow-600">{notMarkedCount}</strong></span>
              </div>
            </div>
            {!isEditMode && !attendanceExists && (
              <button
                onClick={handleEnterEditMode}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200"
              >
                <PenSquare size={18} />
                Start Marking Attendance
              </button>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className="text-center text-xs text-gray-400">
          <p>Click <strong>"Edit Mode"</strong> to mark or update attendance. Changes are only saved when you click <strong>"Save Changes"</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;