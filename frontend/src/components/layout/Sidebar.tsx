import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  School,
  Shield,
  Database,
  BarChart3,
  Bell,
  BookMarked,
  UserPlus,
  Award,
  CreditCard,
  Download,
  GraduationCap,
  Gift,
  TrendingUp,
  Clock
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  // SuperAdmin Menu
  const superAdminMenu = [
    { path: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admins', label: 'Admins', icon: Shield },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/teachers', label: 'Teachers', icon: UserCircle },
    { path: '/classes', label: 'Classes', icon: BookOpen },
    { path: '/attendance', label: 'Attendance', icon: Calendar },
    { path: '/exams', label: 'Exams', icon: FileText },
    { path: '/system', label: 'System', icon: Database },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Admin Menu - All links point to admin routes
  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/teachers', label: 'Teachers', icon: UserCircle },
    { path: '/admin/classes', label: 'Classes', icon: BookOpen },
    { path: '/admin/subjects', label: 'Subjects', icon: BookMarked },
    { path: '/admin/teacher-assignments', label: 'Teacher Assignments', icon: UserPlus },
    { path: '/admin/attendance-reports', label: 'Attendance Reports', icon: Calendar },
    { path: '/admin/exams', label: 'Exams', icon: FileText },
    { path: '/admin/results', label: 'Results', icon: Award },
    { path: '/admin/report-cards', label: 'Report Cards', icon: Download },
  
    { path: '/admin/holidays', label: 'Holidays', icon: Gift },
    { path: '/admin/academic-years', label: 'Academic Years', icon: GraduationCap },
    
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Teacher Menu
  const teacherMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/my-classes', label: 'My Classes', icon: BookOpen },
    { path: '/mark-attendance', label: 'Mark Attendance', icon: Calendar },
        { path: '/attendance-reports', label: 'Attendance Reports', icon: TrendingUp },

    { path: '/enter-marks', label: 'Enter Marks', icon: FileText },
    { path: '/profile', label: 'Profile', icon: UserCircle },
            { path: '/schedule', label: 'Schedule', icon: Clock },



  ];

  // Student Menu
  const studentMenu = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/my-attendance', label: 'My Attendance', icon: Calendar },
    { path: '/my-results', label: 'My Results', icon: FileText },
    { path: '/student-profile', label: 'Profile', icon: UserCircle },
        { path: '/report-card', label: 'Report Card', icon: UserCircle },


  ];

  // Parent Menu
  const parentMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/child-attendance', label: 'Child Attendance', icon: Calendar },
    { path: '/child-results', label: 'Child Results', icon: FileText },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  let menu = [];
  if (user?.role === 'SUPERADMIN') {
    menu = superAdminMenu;
  } else if (user?.role === 'ADMIN') {
    menu = adminMenu;
  } else if (user?.role === 'TEACHER') {
    menu = teacherMenu;
  } else if (user?.role === 'STUDENT') {
    menu = studentMenu;
  } else if (user?.role === 'PARENT') {
    menu = parentMenu;
  }

  return (
    // REMOVED "fixed left-0 top-0" - now it works with Layout
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <School className="text-blue-500" size={28} />
          <span className="text-xl font-bold">EduManage</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 capitalize">{user?.role} Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;