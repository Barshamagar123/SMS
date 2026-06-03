// src/pages/teacher/MyStudents.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Search, Phone, Mail, Calendar, Loader2, User } from 'lucide-react';
import { useClassStudents } from '../../hooks/useTeacherData';

const TeacherMyStudents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const { students, loading, className } = useClassStudents(classId ? parseInt(classId) : null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 text-sm mt-1">{className}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl">
          <Loader2 size={40} className="animate-spin text-blue-500" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={24} className="text-white" />
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
                    <span>{student.email}</span>
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

export default TeacherMyStudents;