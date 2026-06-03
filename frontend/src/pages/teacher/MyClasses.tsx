// src/pages/teacher/MyClasses.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Sparkles, RefreshCw, BookOpen, 
  Star, Award, Users, TrendingUp, ChevronRight,
  Loader2, AlertCircle, School
} from 'lucide-react';
import { ClassCard, ClassCardSkeleton } from '../../components/teacher/ClassCard';
import toast from 'react-hot-toast';

interface TeacherClass {
  classId: number;
  subjectId: number;
  displayName: string;
  subjectName: string;
  subjectCode: string;
  isPrimary: boolean;
  studentCount: number;
  students?: Array<{ id: number; name: string; rollNumber: string }>;
}

const TeacherMyClasses: React.FC = () => {
  const [myClasses, setMyClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUniqueStudents, setTotalUniqueStudents] = useState(0);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/teacher-assignments/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        let classes = [];
        
        if (data.data?.classes) {
          classes = data.data.classes;
        } else if (Array.isArray(data.data)) {
          classes = data.data;
        } else if (Array.isArray(data)) {
          classes = data;
        }
        
        // Set to track unique student IDs across all classes
        const uniqueStudentIds = new Set<number>();
        const formattedClasses: TeacherClass[] = [];
        
        for (const cls of classes) {
          const classId = cls.classId || cls.id;
          
          let studentsList: Array<{ id: number; name: string; rollNumber: string }> = [];
          let studentCount = 0;
          
          try {
            const studentsRes = await fetch(`http://localhost:3000/api/teacher-assignments/class/${classId}/students`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const studentsData = await studentsRes.json();
            console.log(`Students for class ${classId}:`, studentsData);
            
            if (studentsData.success && studentsData.data?.students) {
              studentsList = studentsData.data.students;
              studentCount = studentsList.length;
              
              // Add each student ID to the unique set
              studentsList.forEach(student => {
                uniqueStudentIds.add(student.id);
              });
            }
          } catch (err) {
            console.error(`Failed to fetch students for class ${classId}:`, err);
          }
          
          formattedClasses.push({
            classId: classId,
            subjectId: cls.subjectId || cls.subject?.id,
            displayName: cls.displayName || cls.className || `${cls.class?.name || cls.name} ${cls.class?.section || cls.section || ''}`,
            subjectName: cls.subjectName || cls.subject?.name,
            subjectCode: cls.subjectCode || cls.subject?.code,
            isPrimary: cls.isPrimary || false,
            studentCount: studentCount,
            students: studentsList
          });
        }
        
        setMyClasses(formattedClasses);
        setTotalUniqueStudents(uniqueStudentIds.size);
        console.log('Unique Student IDs:', Array.from(uniqueStudentIds));
        console.log('Total Unique Students:', uniqueStudentIds.size);
        
      } else {
        setError(data.message || 'Failed to fetch classes');
        toast.error(data.message || 'Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please check your connection.');
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyClasses();
    toast.success('Classes refreshed');
  };

  const filteredClasses = myClasses.filter(cls =>
    cls.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const primaryCount = myClasses.filter(c => c.isPrimary).length;
  const secondaryCount = myClasses.length - primaryCount;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="relative z-10 p-8 text-white">
            <h1 className="text-3xl font-bold">My Classes</h1>
            <p className="text-blue-100 mt-2">Loading your classes...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <ClassCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="relative z-10 p-8 text-white">
            <h1 className="text-3xl font-bold">My Classes</h1>
            <p className="text-blue-100 mt-2">View and manage all your teaching assignments</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <p className="text-gray-700 text-lg mb-2">{error}</p>
          <button 
            onClick={fetchMyClasses}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <span className="text-sm font-medium">My Classes</span>
              </div>
              <h1 className="text-3xl font-bold">Assigned Classes</h1>
              <p className="text-blue-100 mt-2">View and manage all your teaching assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 backdrop-blur rounded-lg p-2 hover:bg-white/30 transition-all"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2">
                <span className="text-sm">{myClasses.length} Classes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Now showing UNIQUE students */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-blue-700">{myClasses.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Primary Classes</p>
              <p className="text-2xl font-bold text-green-700">{primaryCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Star size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Secondary Classes</p>
              <p className="text-2xl font-bold text-purple-700">{secondaryCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Award size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-orange-700">{totalUniqueStudents}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users size={18} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Unique students across all classes</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by class name, subject, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No classes found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try a different search term' : 'No classes assigned to you yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls.classId}
              classId={cls.classId}
              subjectId={cls.subjectId}
              displayName={cls.displayName}
              subjectName={cls.subjectName}
              subjectCode={cls.subjectCode}
              isPrimary={cls.isPrimary}
              studentCount={cls.studentCount}
            />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {filteredClasses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{primaryCount} Primary Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{secondaryCount} Secondary Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{totalUniqueStudents} Unique Students</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">Total Classes: {filteredClasses.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMyClasses;