// src/pages/teacher/MyStudents.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, School, Users, Loader2, AlertCircle } from 'lucide-react';
import { StudentList } from '../../components/teacher/StudentList';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  admissionDate: string;
}

const TeacherMyStudents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/teacher-assignments/class/${classId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data?.students || []);
        setClassName(data.data?.className || 'Class');
      } else {
        toast.error(data.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-sm font-medium">Students</span>
          </div>
          <h1 className="text-3xl font-bold">My Students</h1>
          <p className="text-blue-100 mt-2">{className}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
              <School size={14} />
              <span>Class ID: {classId}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm">
              <Users size={14} />
              <span>{students.length} Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <StudentList
        students={students}
        loading={loading}
        searchPlaceholder="Search by name or roll number..."
      />
    </div>
  );
};

export default TeacherMyStudents;