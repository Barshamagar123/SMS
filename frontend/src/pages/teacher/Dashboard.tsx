// src/pages/teacher/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, Calendar, FileText, Loader2, 
  UserCheck, GraduationCap, School, Eye, TrendingUp,
  CheckCircle, Clock, Award, Sparkles, Bell, ChevronRight,
  BarChart3, MessageSquare, Coffee, Star
} from 'lucide-react';

interface TeacherClass {
  classId: number;
  subjectId: number;
  displayName: string;
  subjectName: string;
  subjectCode: string;
  isPrimary: boolean;
}

const TeacherDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch profile
      const profileRes = await fetch('http://localhost:3000/api/auth/teachers/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      }

      // Fetch classes
      const classesRes = await fetch('http://localhost:3000/api/teacher-assignments/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classesData = await classesRes.json();

      if (classesData.success) {
        const classes = classesData.data?.classes || classesData.data || [];
        // Ensure each class has a subjectId (use subject.id if available)
        const formattedClasses = classes.map((cls: any) => ({
          ...cls,
          subjectId: cls.subjectId || cls.subject?.id || cls.subject_id || 0
        }));
        setMyClasses(formattedClasses);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="relative">
            <Loader2 size={60} className="animate-spin text-blue-500 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <School size={24} className="text-blue-300" />
            </div>
          </div>
          <p className="text-gray-500 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalStudents = myClasses.length * 25;
  const completedTasks = myClasses.filter(c => c.isPrimary).length;
  const pendingTasks = myClasses.length - completedTasks;

  const stats = [
    { title: 'My Classes', value: myClasses.length, icon: <BookOpen size={24} />, color: 'from-blue-500 to-blue-600', change: '+2' },
    { title: 'Total Students', value: totalStudents, icon: <Users size={24} />, color: 'from-green-500 to-green-600', change: '+15' },
    { title: 'Subjects', value: myClasses.length, icon: <GraduationCap size={24} />, color: 'from-purple-500 to-purple-600', change: '0' },
    { title: 'Attendance Rate', value: '94%', icon: <TrendingUp size={24} />, color: 'from-orange-500 to-orange-600', change: '+5%' },
  ];

  const quickActions = [
    { title: 'Mark Attendance', icon: <UserCheck size={20} />, path: '/mark-attendance', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-700' },
    { title: 'Enter Marks', icon: <FileText size={20} />, path: '/enter-marks', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    { title: 'My Students', icon: <Users size={20} />, path: '/my-students', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
    { title: 'My Classes', icon: <BookOpen size={20} />, path: '/my-classes', color: 'from-orange-500 to-red-600', bg: 'bg-orange-50', text: 'text-orange-700' },
    { title: 'Schedule', icon: <Calendar size={20} />, path: '/schedule', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50', text: 'text-teal-700' },
    { title: 'My Results', icon: <Award size={20} />, path: '/my-results', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-700' },
  ];

  const upcomingEvents = [
    { title: 'Staff Meeting', time: 'Today, 3:00 PM', icon: <Users size={14} />, color: 'bg-indigo-100' },
    { title: 'Math Exam', time: 'Tomorrow, 9:00 AM', icon: <FileText size={14} />, color: 'bg-blue-100' },
    { title: 'Parent-Teacher Meeting', time: 'Friday, 2:00 PM', icon: <MessageSquare size={14} />, color: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-sm font-medium">{greeting}!</span>
              </div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.name?.split(' ')[0] || 'Teacher'} 👋</h1>
              <p className="text-blue-100 mt-2">Here's what's happening with your classes today.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <School size={14} />
                  <span className="text-sm">{profile?.employeeId || 'Loading...'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <GraduationCap size={14} />
                  <span className="text-sm">{profile?.specialization || 'Teacher'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <Clock size={14} />
                  <span className="text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <Link to="/profile" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300 hover:scale-110">
              <Eye size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  {stat.change !== '0' && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-green-500">↑ {stat.change}</span>
                      <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            Quick Actions
          </h2>
          <span className="text-xs text-gray-400">Click to get started</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-gray-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">{action.icon}</div>
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Classes Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" />
                  My Assigned Classes
                </h2>
                {myClasses.length > 0 && (
                  <Link to="/my-classes" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
            {myClasses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myClasses.slice(0, 4).map((cls, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School size={14} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">{cls.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <BookOpen size={12} className="text-gray-400" />
                            <span className="text-gray-700">{cls.subjectName}</span>
                            <span className="text-xs text-gray-400 ml-1">({cls.subjectCode})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {cls.isPrimary ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                              <CheckCircle size={10} />
                              Primary
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                              Secondary
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/mark-attendance?classId=${cls.classId}&className=${encodeURIComponent(cls.displayName)}`}
                              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Attendance
                            </Link>
                            <Link 
                              to={`/enter-marks?classId=${cls.classId}&subjectId=${cls.subjectId}&className=${encodeURIComponent(cls.displayName)}&subjectName=${encodeURIComponent(cls.subjectName)}`}
                              className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Marks
                            </Link>
                            <Link 
                              to={`/my-students?classId=${cls.classId}`}
                              className="px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              Students
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No classes assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">Contact your administrator for class assignments</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Task Overview */}
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-blue-600" />
              </div>
              Task Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Primary Classes</span>
                <span className="font-bold text-blue-600">{completedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(completedTasks / (myClasses.length || 1)) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Secondary Classes</span>
                <span className="font-bold text-purple-600">{pendingTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(pendingTasks / (myClasses.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <div className={`w-8 h-8 ${event.color} rounded-lg flex items-center justify-center`}>
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                  <Bell size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Card */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star size={18} className="text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Great Job!</h4>
                <p className="text-sm text-gray-600 mt-1">You have completed {completedTasks} of {myClasses.length} class assignments this semester.</p>
                <div className="mt-3 flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">4.8 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;