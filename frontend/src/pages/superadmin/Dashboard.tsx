import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/api';
import CreateAdminModal from '../../components/superadmin/CreateAdminModal';
import { 
  Shield, Users, UserCheck, BookOpen, Calendar, 
  Settings, Database, Activity, Trash2, Mail, Phone,
  TrendingUp, Award, RefreshCw, Download,
  School, BarChart3, UserPlus
} from 'lucide-react';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalClasses: 8,
    todayAttendance: 94.5
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const users = await authApi.getAllUsers();
      const allUsers = users.data.data;
      // ✅ Only show ACTIVE admins
      const adminUsers = allUsers.filter((u: any) => u.role === 'ADMIN' && u.isActive === true);
      const studentUsers = allUsers.filter((u: any) => u.role === 'STUDENT' && u.isActive === true);
      const teacherUsers = allUsers.filter((u: any) => u.role === 'TEACHER' && u.isActive === true);
      
      setAdmins(adminUsers);
      setStats({
        totalStudents: studentUsers.length,
        totalTeachers: teacherUsers.length,
        totalAdmins: adminUsers.length,
        totalClasses: 8,
        todayAttendance: 94.5
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate admin "${name}"?`)) {
      setDeletingId(id);
      try {
        await authApi.deleteUser(id);
        await fetchData();
        alert('Admin deactivated successfully');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to deactivate admin');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: UserCheck, color: 'bg-green-500', change: '+5%' },
    { title: 'Total Admins', value: stats.totalAdmins, icon: Shield, color: 'bg-purple-500', change: '+0%' },
    { title: 'Total Classes', value: stats.totalClasses, icon: BookOpen, color: 'bg-orange-500', change: '+2%' },
    { title: 'Attendance Today', value: `${stats.todayAttendance}%`, icon: Calendar, color: 'bg-indigo-500', change: '+3%' },
    { title: 'System Health', value: '98%', icon: Activity, color: 'bg-teal-500', change: 'Good' },
  ];

  const systemHealth = [
    { metric: 'API Status', value: 'Healthy', status: 'success', icon: Activity },
    { metric: 'Database', value: 'Connected', status: 'success', icon: Database },
    { metric: 'Storage', value: '45% Used', status: 'warning', icon: Database },
    { metric: 'Last Backup', value: '2 hours ago', status: 'info', icon: RefreshCw },
  ];

  const recentActivities = [
    { id: 1, action: 'New admin created', user: 'Super Admin', time: '10 minutes ago', icon: Shield },
    { id: 2, action: 'Student registered', user: 'Admin', time: '1 hour ago', icon: Users },
    { id: 3, action: 'Attendance marked', user: 'Teacher John', time: '2 hours ago', icon: Calendar },
    { id: 4, action: 'Exam results published', user: 'Admin', time: '3 hours ago', icon: Award },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} />
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-purple-100">Welcome back, {user?.name}! You have full system access.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
              <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-xs mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Admin Management</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              <UserPlus size={16} />
              Add Admin
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No admins found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Create your first admin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 rounded-xl">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Shield size={14} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail size={12} /> {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone size={10} /> {admin.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          disabled={deletingId === admin.id}
                          className="p-1 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                          title="Deactivate Admin"
                        >
                          {deletingId === admin.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-3">
            {systemHealth.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
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
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition">
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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="p-4 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition text-center group"
            >
              <UserPlus size={24} className="mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium">Create Admin</span>
            </button>
            <button className="p-4 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition text-center group">
              <Settings size={24} className="mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="p-4 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition text-center group">
              <Database size={24} className="mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium">Backup</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition text-center group">
              <Download size={24} className="mx-auto mb-2 group-hover:scale-110 transition" />
              <span className="text-sm font-medium">Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default SuperAdminDashboard;