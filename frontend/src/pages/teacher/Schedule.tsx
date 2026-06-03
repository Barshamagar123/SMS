// src/pages/teacher/Schedule.tsx

import React from 'react';
import { Calendar, Clock, MapPin, BookOpen, Loader2 } from 'lucide-react';
import { useTeacherSchedule } from '../../hooks/useTeacherData';

const TeacherSchedule: React.FC = () => {
  const { schedule, loading } = useTeacherSchedule();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">Weekly teaching timetable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {schedule.map((day) => (
          <div key={day.day} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white text-center">
              <h3 className="font-bold">{day.day}</h3>
            </div>
            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
              {day.classes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No classes</p>
              ) : (
                day.classes.map((cls, idx) => (
                  <div key={idx} className="border rounded-lg p-2 hover:bg-gray-50">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                      <Clock size={12} />
                      <span>{cls.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-600 mt-1">{cls.className}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <BookOpen size={10} />
                      <span>{cls.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin size={10} />
                      <span>{cls.room}</span>
                    </div>
                    {cls.isPrimary && (
                      <span className="inline-block mt-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        Primary
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSchedule;