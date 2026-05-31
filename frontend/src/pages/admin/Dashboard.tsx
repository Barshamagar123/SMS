import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, BookOpen, Calendar, 
  Award, School, PlusCircle, RefreshCw, Eye, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        fetch('http://localhost:3000/api/auth/superadmin/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/auth/teachers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/subjects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      const classesData = await classesRes.json();
      const subjectsData = await subjectsRes.json();

      setStats({
        totalStudents: studentsData.data?.length || 0,
        totalTeachers: teachersData.data?.length || 0,
        totalClasses: classesData.data?.length || 0,
        totalSubjects: subjectsData.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', link: '/admin/students' },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: UserCheck, color: 'bg-green-500', link: '/admin/teachers' },
    { title: 'Total Classes', value: stats.totalClasses, icon: School, color: 'bg-purple-500', link: '/admin/classes' },
    { title: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'bg-orange-500', link: '/admin/subjects' },
  ];

  const quickActions = [
    { title: 'Add Student', icon: PlusCircle, color: 'bg-blue-500', link: '/admin/students', desc: 'Register new student' },
    { title: 'Add Teacher', icon: UserCheck, color: 'bg-green-500', link: '/admin/teachers', desc: 'Register new teacher' },
    { title: 'Create Class', icon: School, color: 'bg-purple-500', link: '/admin/classes', desc: 'Add new class' },
    { title: 'Add Subject', icon: BookOpen, color: 'bg-orange-500', link: '/admin/subjects', desc: 'Add new subject' },
    { title: 'View Attendance', icon: Calendar, color: 'bg-indigo-500', link: '/admin/attendance', desc: 'Check reports' },
    { title: 'Manage Exams', icon: Award, color: 'bg-pink-500', link: '/admin/exams', desc: 'Schedule exams' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={48} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-1">Admin Dashboard - Manage your school</p>
        <button 
          onClick={fetchData}
          className="mt-3 flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {statCards.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition hover:-translate-y-1 block"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-3">{stat.value}</h3>
            <p className="text-gray-500 text-sm mt-1">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.link}
              className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition text-center group block"
            >
              <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-2 group-hover:scale-110 transition`}>
                <action.icon size={22} />
              </div>
              <span className="text-sm font-medium text-gray-700 block">{action.title}</span>
              <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New student registered</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
            <Eye size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <UserCheck size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New teacher joined</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
            <Eye size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Attendance marked for Class 10</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
            <Eye size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <School size={16} className="inline mr-2" />
        EduManage Admin Portal - Manage your school efficiently
      </div>
    </div>
  );
};

export default AdminDashboard;