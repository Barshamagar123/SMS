// src/pages/student/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, BookOpen, DollarSign, Award, Clock, Loader2 } from 'lucide-react';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentAttendance } from '../../hooks/useStudentAttendance';
import { useStudentResults } from '../../hooks/useStudentResults';
import StatsCard from '../../components/student/StatsCard';
import ResultsTable from '../../components/student/ResultsTable';

const StudentDashboard: React.FC = () => {
  const { profile, loading: profileLoading } = useStudentProfile();
  const { attendance, loading: attendanceLoading } = useStudentAttendance();
  const { results, loading: resultsLoading } = useStudentResults();

  if (profileLoading || attendanceLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentResults = results.slice(0, 5);

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {profile?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-500 mt-1">
          {profile?.className} | Roll No: {profile?.rollNumber}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Attendance"
          value={`${attendance?.summary?.percentage?.toFixed(1) || 0}%`}
          icon={Calendar}
          color="blue"
          subtitle={`${attendance?.summary?.presentDays || 0}/${attendance?.summary?.totalDays || 0} days`}
        />
        <StatsCard
          title="Average Marks"
          value={`${results.reduce((acc, r) => acc + r.percentage, 0) / (results.length || 1)}%`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Exams"
          value={results.length}
          icon={BookOpen}
          color="purple"
        />
        <StatsCard
          title="Best Grade"
          value={results.reduce((best, r) => {
            const gradeOrder = { 'A+': 1, 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'F': 6 };
            return gradeOrder[r.grade as keyof typeof gradeOrder] < gradeOrder[best as keyof typeof gradeOrder] ? r.grade : best;
          }, 'N/A')}
          icon={Award}
          color="orange"
        />
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Results</h2>
          <Link to="/student/my-results" className="text-blue-600 hover:text-blue-700 text-sm">
            View All →
          </Link>
        </div>
        <ResultsTable results={recentResults} loading={resultsLoading} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/student/my-attendance" className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Attendance</p>
        </Link>
        <Link to="/student/my-results" className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Results</p>
        </Link>
        <Link to="/student/report-card" className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Report Card</p>
        </Link>
        <Link to="/student/my-profile" className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition text-center">
          <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;