import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Users, UserCheck, BookOpen, Calendar, TrendingUp, Award, Settings, Database, Activity } from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Schools', value: '1', icon: '🏫', color: 'bg-purple-500', change: '+0%' },
    { title: 'Total Admins', value: '3', icon: Shield, color: 'bg-indigo-500', change: '+1' },
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Total Teachers', value: '48', icon: UserCheck, color: 'bg-green-500', change: '+5%' },
    { title: 'Total Classes', value: '24', icon: BookOpen, color: 'bg-purple-500', change: '+2%' },
    { title: 'Attendance Today', value: '94%', icon: Calendar, color: 'bg-orange-500', change: '+3%' },
  ];

  const systemHealth = [
    { metric: 'API Status', value: 'Healthy', status: 'success', icon: Activity },
    { metric: 'Database', value: 'Connected', status: 'success', icon: Database },
    { metric: 'Storage', value: '45% Used', status: 'warning', icon: Database },
    { metric: 'Last Backup', value: '2 hours ago', status: 'info', icon: Database },
  ];

  const recentActivities = [
    { id: 1, action: 'New Admin created', user: 'Super Admin', time: '10 minutes ago', icon: Shield },
    { id: 2, action: 'System settings updated', user: 'Super Admin', time: '1 hour ago', icon: Settings },
    { id: 3, action: 'New student registered', user: 'Admin', time: '2 hours ago', icon: Users },
    { id: 4, action: 'Backup completed', user: 'System', time: '3 hours ago', icon: Database },
    { id: 5, action: 'New teacher joined', user: 'Admin', time: '5 hours ago', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} />
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-purple-100 mt-1">Welcome back, {user?.name}! You have full system access.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl`}>
                {typeof stat.icon === 'string' ? stat.icon : <stat.icon size={20} />}
              </div>
              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-xs mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
            <Activity size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {systemHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{item.metric}</span>
                </div>
                <span className={`text-sm font-medium ${
                  item.status === 'success' ? 'text-green-600' :
                  item.status === 'warning' ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center">
                  <activity.icon size={16} className="text-gray-600" />
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

      {/* Super Admin Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors text-center">
            <Shield size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Create Admin</span>
          </button>
          <button className="p-4 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors text-center">
            <Users size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Schools</span>
          </button>
          <button className="p-4 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors text-center">
            <Settings size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">System Settings</span>
          </button>
          <button className="p-4 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition-colors text-center">
            <Database size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;