import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const adminMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫' },
    { path: '/admin/classes', label: 'Classes', icon: '🏫' },
    { path: '/admin/subjects', label: 'Subjects', icon: '📚' },
    { path: '/admin/attendance-report', label: 'Attendance', icon: '📝' },
    { path: '/admin/exams', label: 'Exams', icon: '✏️' },
    { path: '/admin/holidays', label: 'Holidays', icon: '🎉' },
  ];

  const teacherMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/teacher/mark-attendance', label: 'Mark Attendance', icon: '✅' },
    { path: '/teacher/enter-marks', label: 'Enter Marks', icon: '📝' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const studentMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/my-attendance', label: 'My Attendance', icon: '📅' },
    { path: '/student/my-results', label: 'My Results', icon: '🎓' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const parentMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  let menu = [];
  if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
    menu = adminMenu;
  } else if (user?.role === 'TEACHER') {
    menu = teacherMenu;
  } else if (user?.role === 'STUDENT') {
    menu = studentMenu;
  } else if (user?.role === 'PARENT') {
    menu = parentMenu;
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-center border-b border-gray-800">
        <h1 className="text-xl font-bold">EduManage</h1>
        <p className="text-xs text-gray-400 mt-1">{user?.role}</p>
      </div>
      <nav className="flex-1 p-4">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg mb-2 transition-colors ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;