// src/components/layout/Header.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, ChevronDown, Settings, LogOut, Shield, School, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.js';  // ✅ ADD THIS IMPORT

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPERADMIN': return 'bg-purple-100 text-purple-700';
      case 'ADMIN': return 'bg-blue-100 text-blue-700';
      case 'TEACHER': return 'bg-green-100 text-green-700';
      case 'STUDENT': return 'bg-orange-100 text-orange-700';
      case 'PARENT': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'SUPERADMIN': return <Shield size={16} />;
      case 'ADMIN': return <School size={16} />;
      case 'TEACHER': return <Users size={16} />;
      case 'STUDENT': return <BookOpen size={16} />;
      default: return <User size={16} />;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Welcome Message */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome back, {user?.name}!
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">{formatDate()}</p>
              <span className="text-gray-300">•</span>
              <p className="text-sm text-gray-500">{formatTime()}</p>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getRoleBadgeColor()}`}>
              {getRoleIcon()}
              <span className="text-xs font-medium capitalize">{user?.role}</span>
            </div>

            {/* ✅ REPLACE static notification with NotificationBell */}
            <NotificationBell />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings size={16} />
                    Account Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;