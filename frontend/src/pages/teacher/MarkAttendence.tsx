// src/pages/teacher/MarkAttendance.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, Sparkles, School, Users, Save, 
  Loader2, RefreshCw, AlertCircle, FileWarning
} from 'lucide-react';
import { AttendanceTable } from '../../components/teacher/AttendenceTable';
import { StatsCards } from '../../components/teacher/StatsCards';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  rollNumber: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | null;
  attendanceId: number | null;
}

const TeacherMarkAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const className = searchParams.get('className') || 'Class';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId, selectedDate]);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      console.log(`Fetching students for class ${classId} on date ${selectedDate}`);
      
      let studentsList = [];
      
      try {
        const response = await fetch(`http://localhost:3000/api/teacher-assignments/class/${classId}/students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Teacher-assignments response:', data);
        
        if (data.success && data.data?.students) {
          studentsList = data.data.students;
        }
      } catch (err) {
        console.error('Error fetching from teacher-assignments:', err);
      }
      
      if (studentsList.length === 0) {
        try {
          const response = await fetch(`http://localhost:3000/api/attendance/class/${classId}/students?date=${selectedDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          console.log('Attendance endpoint response:', data);
          
          if (data.success && data.data?.students) {
            studentsList = data.data.students;
          }
        } catch (err) {
          console.error('Error fetching from attendance endpoint:', err);
        }
      }
      
      const formattedStudents = studentsList.map((student: any) => ({
        id: student.id || student.studentId,
        rollNumber: student.rollNumber,
        name: student.name || student.studentName,
        status: student.status || null,
        attendanceId: student.attendanceId || null
      }));
      
      console.log('Formatted students:', formattedStudents);
      setStudents(formattedStudents);
      
      if (formattedStudents.length === 0) {
        setError('No students found in this class. Please ensure students are enrolled.');
      }
      
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setError('Failed to load students. Please try again.');
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status } : s
    ));
  };

  const handleMarkAllPresent = () => {
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
    toast.success(`All students marked as present`);
  };

  const handleMarkAllAbsent = () => {
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: 'ABSENT' })));
    toast.success(`All students marked as absent`);
  };

  const handleSave = async () => {
    if (students.length === 0) {
      toast.error('No students found in this class');
      return;
    }
    
    const markedCount = students.filter(s => s.status !== null).length;
    if (markedCount === 0) {
      toast.error('Please mark attendance for at least one student');
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
        toast.success('Attendance saved successfully');
        await fetchStudents();
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
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

  const stats = [
    { title: 'Total Students', value: students.length, icon: <Users size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Present', value: presentCount, icon: <Users size={20} />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Absent', value: absentCount, icon: <Users size={20} />, color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Completion', value: `${completionPercentage.toFixed(0)}%`, icon: <Users size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  if (error && students.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="relative z-10 p-8 text-white">
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-blue-100 mt-2">{className}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
          <FileWarning size={64} className="mx-auto text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Students Found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchStudents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Date Selector */}
      <div className="bg-white rounded-2xl shadow-lg border p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.bgColor === 'bg-blue-100' ? 'from-blue-50 to-indigo-50' : stat.bgColor === 'bg-green-100' ? 'from-green-50 to-emerald-50' : stat.bgColor === 'bg-red-100' ? 'from-red-50 to-rose-50' : 'from-purple-50 to-pink-50'} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Alert */}
      {notMarkedCount > 0 && students.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{notMarkedCount}</span> student(s) pending. Please mark attendance for all students.
          </p>
        </div>
      )}

      {/* Attendance Table */}
      <AttendanceTable
        students={students}
        loading={loading}
        onStatusChange={handleStatusChange}
        onMarkAllPresent={handleMarkAllPresent}
        onMarkAllAbsent={handleMarkAllAbsent}
        presentCount={presentCount}
        absentCount={absentCount}
        notMarkedCount={notMarkedCount}
      />

      {/* Save Button */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving Attendance...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherMarkAttendance;