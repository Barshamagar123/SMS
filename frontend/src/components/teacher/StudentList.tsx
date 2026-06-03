// src/components/teacher/StudentList.tsx

import React, { useState } from 'react';
import { Search, User, Mail, Phone, Calendar, Loader2, Users } from 'lucide-react';

interface Student {
  id: number;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  admissionDate: string;
}

interface StudentListProps {
  students: Student[];
  loading: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  loading,
  className = '',
  searchPlaceholder = 'Search by name or roll number...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Students ({students.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Student Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-16">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold">{student.name}</h3>
                    <p className="text-blue-100 text-sm">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {student.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    <span>Parent: {student.parentPhone}</span>
                  </div>
                )}
                {student.admissionDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Admission: {new Date(student.admissionDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};