// src/pages/teacher/Schedule.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Loader2, Sparkles, School } from 'lucide-react';
import { ScheduleCard } from '../../components/teacher/ScheduleCard';
import toast from 'react-hot-toast';

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

const TeacherSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSchedule(data.data?.schedule || []);
      } else {
        toast.error(data.message || 'Failed to load schedule');
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast.error('Failed to load schedule');
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
            <span className="text-sm font-medium">Timetable</span>
          </div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-blue-100 mt-2">Weekly teaching timetable</p>
        </div>
      </div>

      {/* Full Week Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {schedule.map((day) => (
          <div key={day.day} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white text-center">
              <h3 className="font-bold">{day.day}</h3>
            </div>
            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
              {day.classes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No classes</p>
              ) : (
                day.classes.map((cls, idx) => (
                  <div key={idx} className="border rounded-lg p-2 hover:bg-gray-50 transition">
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

      {schedule.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No schedule available</p>
        </div>
      )}
    </div>
  );
};

export default TeacherSchedule;