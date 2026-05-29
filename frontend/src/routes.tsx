import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Classes from './pages/admin/Classes';
import Subjects from './pages/admin/Subjects';
import AttendanceReport from './pages/admin/AttendanceReport';
import Exams from './pages/admin/Exams';
import Holidays from './pages/admin/Holidays';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import EnterMarks from './pages/teacher/EnterMarks';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyResults from './pages/student/MyResults';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';

// Common Pages
import Home from './pages/common/Home';
import Profile from './pages/common/Profile';
import NotFound from './pages/common/NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return <Home />;
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
        return <Home />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Home />} />
      
      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={getDashboard()} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin Routes */}
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Students /></ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Teachers /></ProtectedRoute>
        } />
        <Route path="/admin/classes" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Classes /></ProtectedRoute>
        } />
        <Route path="/admin/subjects" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Subjects /></ProtectedRoute>
        } />
        <Route path="/admin/attendance-report" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><AttendanceReport /></ProtectedRoute>
        } />
        <Route path="/admin/exams" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Exams /></ProtectedRoute>
        } />
        <Route path="/admin/holidays" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}><Holidays /></ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/mark-attendance" element={
          <ProtectedRoute allowedRoles={['TEACHER']}><MarkAttendance /></ProtectedRoute>
        } />
        <Route path="/teacher/enter-marks" element={
          <ProtectedRoute allowedRoles={['TEACHER']}><EnterMarks /></ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/my-attendance" element={
          <ProtectedRoute allowedRoles={['STUDENT']}><MyAttendance /></ProtectedRoute>
        } />
        <Route path="/student/my-results" element={
          <ProtectedRoute allowedRoles={['STUDENT']}><MyResults /></ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;