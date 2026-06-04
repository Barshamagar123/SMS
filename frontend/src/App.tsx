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

import StudentDashboard from './pages/student/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import AdminAttendanceReports from './pages/admin/AttendenceReports';
import AdminResults from './pages/admin/Results';
import AdminReportCards from './pages/admin/ReportCards';
import AdminHolidays from './pages/admin/Holidays';
import AdminAcademicYears from './pages/admin/AcademicYears';
import AdminExams from './pages/admin/Exams';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherProfile from './pages/teacher/Profile';
import TeacherMyClasses from './pages/teacher/MyClasses';
import TeacherMarkAttendance from './pages/teacher/MarkAttendence';
import TeacherEnterMarks from './pages/teacher/EnterMarks';
import TeacherMyStudents from './pages/teacher/MyStudents';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherMyResults from './pages/teacher/MyResults';
import TeacherAttendanceReports from './pages/teacher/AttendanceReports';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'SUPERADMIN': 
      return <Navigate to="/superadmin/dashboard" replace />;
    case 'ADMIN': 
      return <Navigate to="/admin/dashboard" replace />;
    case 'TEACHER': 
      return <Navigate to="/dashboard" replace />;
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
  path="/attendance-reports"
  element={
    <ProtectedRoute>
      <TeacherAttendanceReports />
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
        path="/dashboard"
        element={
<ProtectedRoute>
  <TeacherDashboard />
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
          path="/admin/classes"
          element={
            <ProtectedRoute>
              <AdminClasses />
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
          path="/admin/teacher-assignments"
          element={
            <ProtectedRoute>
              <AdminTeacherAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance-reports"
          element={
            <ProtectedRoute>
              <AdminAttendanceReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <ProtectedRoute>
              <AdminExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute>
              <AdminResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/report-cards"
          element={
            <ProtectedRoute>
              <AdminReportCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/holidays"
          element={
            <ProtectedRoute>
              <AdminHolidays />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic-years"
          element={
            <ProtectedRoute>
              <AdminAcademicYears />
            </ProtectedRoute>
          }
        />
        
        {/* Teacher Routes - Dashboard Redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Teacher Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-classes"
          element={
            <ProtectedRoute>
              <TeacherMyClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mark-attendance"
          element={
            <ProtectedRoute>
              <TeacherMarkAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enter-marks"
          element={
            <ProtectedRoute>
              <TeacherEnterMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-students"
          element={
            <ProtectedRoute>
              <TeacherMyStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <TeacherSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-results"
          element={
            <ProtectedRoute>
              <TeacherMyResults />
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