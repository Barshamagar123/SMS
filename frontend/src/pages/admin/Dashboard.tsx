import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Users, UserCheck, BookOpen, Calendar, TrendingUp, Award, PlusCircle, Download } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Total Teachers', value: '48', icon: UserCheck, color: 'bg-green-500', change: '+5%' },
    { title: 'Total Classes', value: '24', icon: BookOpen, color: 'bg-purple-500', change: '+2%' },
    { title: 'Attendance Today', value: '94%', icon: Calendar, color: 'bg-orange-500', change: '+3%' },
  ];

  const recentActivities = [
    { id: 1, action: 'New student registered', user: 'Admin', time: '2 minutes ago', icon: Users },
    { id: 2, action: 'Attendance marked for Grade 5A', user: 'Teacher John', time: '1 hour ago', icon: Calendar },
    { id: 3, action: 'Exam results published', user: 'Admin', time: '3 hours ago', icon: Award },
    { id: 4, action: 'New teacher joined', user: 'HR', time: '5 hours ago', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-1">Here's what's happening with your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            <PlusCircle size={18} />
            Add Student
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
            <PlusCircle size={18} />
            Add Teacher
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
            <Download size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Overview</h3>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
            <p className="text-gray-500">Chart will appear here</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <activity.icon size={18} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;