// src/pages/teacher/MyClasses.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Star, 
  Search, 
  ChevronRight, 
  Loader2,
  Calendar,
  FileText,
  Clock,
  GraduationCap,
  Award,
  TrendingUp,
  Sparkles,
  Eye,
  BarChart3,
  CheckCircle,
  School
} from 'lucide-react';
import { useTeacherData } from '../../hooks/useTeacherData';

const TeacherMyClasses: React.FC = () => {
  const { myClasses, loading } = useTeacherData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredClasses = myClasses.filter(cls =>
    cls.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="relative">
            <Loader2 size={60} className="animate-spin text-blue-500 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap size={24} className="text-blue-300" />
            </div>
          </div>
          <p className="text-gray-500 mt-4">Loading your classes...</p>
        </div>
      </div>
    );
  }

  const primaryCount = myClasses.filter(c => c.isPrimary).length;
  const secondaryCount = myClasses.length - primaryCount;

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
                <span className="text-sm font-medium">My Classes</span>
              </div>
              <h1 className="text-3xl font-bold">Assigned Classes</h1>
              <p className="text-blue-100 mt-2">View and manage all your teaching assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2">
                <span className="text-sm">{myClasses.length} Classes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by class name, subject, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
                <div className="w-2 h-2 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-current rounded-sm"></div>
                <div className="w-4 h-0.5 bg-current rounded-sm"></div>
                <div className="w-4 h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Classes Display */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No classes found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try a different search term' : 'No classes assigned to you yet'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header with Gradient */}
              <div className={`relative overflow-hidden p-5 text-white ${cls.isPrimary ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{cls.displayName}</h3>
                      <p className="text-white/80 text-sm mt-1">{cls.subjectName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          <BookOpen size={10} />
                          {cls.subjectCode}
                        </span>
                        {cls.isPrimary && (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-400/30 px-2 py-0.5 rounded-full">
                            <Star size={10} />
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap size={20} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to={`/mark-attendance?classId=${cls.classId}&className=${encodeURIComponent(cls.displayName)}`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all duration-200 group/link"
                  >
                    <Calendar size={16} className="group-hover/link:scale-110 transition-transform" />
                    Attendance
                  </Link>
                  <Link 
                    to={`/enter-marks?classId=${cls.classId}&subjectId=${cls.subjectId}&className=${encodeURIComponent(cls.displayName)}&subjectName=${encodeURIComponent(cls.subjectName)}`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-all duration-200 group/link"
                  >
                    <FileText size={16} className="group-hover/link:scale-110 transition-transform" />
                    Marks
                  </Link>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <Link 
                    to={`/my-students?classId=${cls.classId}`}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 group/link"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      View Students
                    </span>
                    <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to={`/my-results?classId=${cls.classId}&subjectId=${cls.subjectId}`}
                    className="flex items-center justify-between text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200 group/link"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 size={16} />
                      View Results
                    </span>
                    <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClasses.map((cls, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                          <School size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{cls.displayName}</p>
                          <p className="text-xs text-gray-500">Class ID: {cls.classId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-gray-400" />
                        <span className="text-gray-700">{cls.subjectName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{cls.subjectCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      {cls.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                          <CheckCircle size={10} />
                          Primary
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          Secondary
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/mark-attendance?classId=${cls.classId}&className=${encodeURIComponent(cls.displayName)}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark Attendance"
                        >
                          <Calendar size={16} />
                        </Link>
                        <Link 
                          to={`/enter-marks?classId=${cls.classId}&subjectId=${cls.subjectId}&className=${encodeURIComponent(cls.displayName)}&subjectName=${encodeURIComponent(cls.subjectName)}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Enter Marks"
                        >
                          <FileText size={16} />
                        </Link>
                        <Link 
                          to={`/my-students?classId=${cls.classId}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Students"
                        >
                          <Users size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats Footer */}
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