import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import Admins from './pages/superadmin/Admins';
import Students from './pages/superadmin/Students';
import Teachers from './pages/superadmin/Teachers';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminTeacherAssignments from './pages/admin/TeachersAssignments';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'SUPERADMIN': 
      return <Navigate to="/superadmin/dashboard" replace />;
    case 'ADMIN': 
      return <Navigate to="/admin/dashboard" replace />;
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
        {/* SuperAdmin Dashboard */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard Redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* SuperAdmin Routes */}
        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <Admins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Teachers />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute>
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute>
              <AdminSubjects />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute>
              <AdminClasses />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Teacher Assignments Route */}
        <Route
          path="/admin/teacher-assignments"
          element={
            <ProtectedRoute>
              <AdminTeacherAssignments />
            </ProtectedRoute>
          }
        />
      </Route>
      
      {/* Root Redirect */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
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