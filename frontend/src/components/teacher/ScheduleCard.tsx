// src/components/teacher/ScheduleCard.tsx

import React from 'react';
import { Clock, MapPin, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScheduleClass {
  time: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  room: string;
  isPrimary: boolean;
}

interface ScheduleDay {
  day: string;
  classes: ScheduleClass[];
}

interface ScheduleCardProps {
  schedule: ScheduleDay[];
  loading: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today);

  return (
    <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">Today's Schedule</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      <div className="p-4">
        {todaySchedule && todaySchedule.classes.length > 0 ? (
          <div className="space-y-3">
            {todaySchedule.classes.map((cls, idx) => (
              <div key={idx} className="border rounded-xl p-3 hover:shadow-md transition">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Clock size={14} className="text-gray-400" />
                  <span>{cls.time}</span>
                  {cls.isPrimary && (
                    <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Primary</span>
                  )}
                </div>
                <p className="text-md font-semibold text-blue-600 mt-1">{cls.className}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>{cls.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{cls.room}</span>
                  </div>
                </div>
                <Link 
                  to={`/mark-attendance?classId=${cls.classId}&className=${encodeURIComponent(cls.className)}`}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  Take Attendance <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        )}

        {schedule.length > 0 && (
          <Link 
            to="/schedule"
            className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700"
          >
            View Full Schedule →
          </Link>
        )}
      </div>
    </div>
  );
};