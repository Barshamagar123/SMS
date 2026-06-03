// src/components/teacher/StatsCards.tsx

import React from 'react';
import { 
  BookOpen, Users, Calendar, TrendingUp, Award, 
  CheckCircle, Clock, GraduationCap, FileText
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, trend }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

interface StatsCardsProps {
  stats: Array<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }>;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

// Predefined stats for different use cases
export const TeacherDashboardStats = ({ classes, students, subjects, attendance }: any) => {
  const stats = [
    { 
      title: 'My Classes', 
      value: classes, 
      icon: <BookOpen size={24} />, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      trend: { value: 12, isPositive: true }
    },
    { 
      title: 'Total Students', 
      value: students, 
      icon: <Users size={24} />, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      title: 'Subjects', 
      value: subjects, 
      icon: <GraduationCap size={24} />, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100' 
    },
    { 
      title: 'Attendance Rate', 
      value: `${attendance}%`, 
      icon: <TrendingUp size={24} />, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100' 
    },
  ];
  return <StatsCards stats={stats} />;
};

export const AttendanceStats = ({ total, present, absent, completion }: any) => {
  const stats = [
    { title: 'Total Students', value: total, icon: <Users size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Present', value: present, icon: <CheckCircle size={20} />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Absent', value: absent, icon: <Clock size={20} />, color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Completion', value: `${completion}%`, icon: <TrendingUp size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];
  return <StatsCards stats={stats} />;
};

export const ExamStats = ({ total, completed, pending, passRate }: any) => {
  const stats = [
    { title: 'Total Exams', value: total, icon: <FileText size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Completed', value: completed, icon: <CheckCircle size={20} />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Pending', value: pending, icon: <Clock size={20} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { title: 'Pass Rate', value: `${passRate}%`, icon: <Award size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];
  return <StatsCards stats={stats} />;
};