import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based Dashboard
const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'ADMIN':
    case 'SUPERADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    default:
      return <AdminDashboard />;
  }
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;