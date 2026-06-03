// src/components/teacher/ClassCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, Calendar, FileText, Star, 
  ChevronRight, School, Clock, Award
} from 'lucide-react';

interface ClassCardProps {
  classId: number;
  subjectId: number;
  displayName: string;
  subjectName: string;
  subjectCode: string;
  isPrimary: boolean;
  studentCount: number;
  onMarkAttendance?: () => void;
  onEnterMarks?: () => void;
  onViewStudents?: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classId,
  subjectId,
  displayName,
  subjectName,
  subjectCode,
  isPrimary,
  studentCount,
}) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className={`relative overflow-hidden p-5 text-white ${isPrimary ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{displayName}</h3>
              <p className="text-white/80 text-sm mt-1">{subjectName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <BookOpen size={10} />
                  {subjectCode}
                </span>
                {isPrimary && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-400/30 px-2 py-0.5 rounded-full">
                    <Star size={10} />
                    Primary
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <Users size={10} />
                  {studentCount} Student{studentCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <School size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to={`/mark-attendance?classId=${classId}&className=${encodeURIComponent(displayName)}`}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all duration-200"
          >
            <Calendar size={16} />
            Attendance
          </Link>
          <Link 
            to={`/enter-marks?classId=${classId}&subjectId=${subjectId}&className=${encodeURIComponent(displayName)}&subjectName=${encodeURIComponent(subjectName)}`}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-all duration-200"
          >
            <FileText size={16} />
            Marks
          </Link>
        </div>

        <div className="border-t pt-3 space-y-2">
          <Link 
            to={`/my-students?classId=${classId}`}
            className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              View Students ({studentCount})
            </span>
            <ChevronRight size={16} />
          </Link>
          <Link 
            to={`/my-results?classId=${classId}&subjectId=${subjectId}`}
            className="flex items-center justify-between text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
          >
            <span className="flex items-center gap-2">
              <Award size={16} />
              View Results
            </span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ClassCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200"></div>
      <div className="p-5 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};