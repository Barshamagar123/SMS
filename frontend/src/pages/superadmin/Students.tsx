import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/api';
import { 
  Search, Eye, Mail, Phone, Calendar, MapPin, 
  User, GraduationCap, BookOpen, AlertCircle, 
  ChevronLeft, ChevronRight, RefreshCw, X,
  School, Users, UserCheck, Home, Calendar as CalendarIcon,
  Droplet, Heart, Flag, Church, FileText, Download,
  Printer, Edit, Trash2, CheckCircle, XCircle, Lock, Unlock,
  Filter, Upload, Image as ImageIcon, Loader2, Trophy, Award,
  Clock, ExternalLink, Shield, Star, TrendingUp, TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentProfile {
  id: number;
  rollNumber: string;
  classId: number;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  parentEmail?: string;
  admissionDate?: string;
  previousSchool?: string;
  previousClass?: string;
  profilePhoto?: string;
  isActive: boolean;
  class?: {
    id: number;
    name: string;
    section: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isFirstLogin: boolean;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  student?: StudentProfile;
}

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterGender, setFilterGender] = useState<string>('ALL');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const itemsPerPage = 9;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await authApi.getSuperAdminStudents();
      if (response.data.success) {
        const studentsData = response.data.data;
        setStudents(studentsData);
        
        // Load photos for all students
        await loadStudentPhotos(studentsData);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPhotos = async (studentsData: Student[]) => {
    const urls: Record<number, string> = {};
    
    for (const student of studentsData) {
      const studentId = student.student?.id;
      const photoPath = student.student?.profilePhoto;
      
      if (studentId) {
        // Try multiple methods to get photo
        
        // Method 1: Direct static file URL if path exists
        if (photoPath) {
          let cleanPath = photoPath;
          if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
          }
          // Remove any double slashes
          cleanPath = cleanPath.replace(/\/+/g, '/');
          const staticUrl = `${API_URL}${cleanPath}`;
          urls[student.id] = staticUrl;
          console.log(`📸 ${student.name}: Trying static URL:`, staticUrl);
          
          // Test if image exists
          try {
            const testResponse = await fetch(staticUrl, { method: 'HEAD' });
            if (testResponse.ok) {
              console.log(`✅ ${student.name}: Photo found at static path`);
              continue;
            } else {
              console.log(`❌ ${student.name}: Static path failed, trying API`);
            }
          } catch {
            console.log(`❌ ${student.name}: Static path error, trying API`);
          }
        }
        
        // Method 2: Use API endpoint
        try {
          const apiUrl = `${API_URL}/api/auth/students/${studentId}/photo`;
          console.log(`📸 ${student.name}: Trying API URL:`, apiUrl);
          
          // For API endpoint, we need to fetch as blob and create object URL
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
              const objectUrl = URL.createObjectURL(blob);
              urls[student.id] = objectUrl;
              console.log(`✅ ${student.name}: Photo loaded from API`);
            } else {
              console.log(`❌ ${student.name}: Empty blob from API`);
              delete urls[student.id];
            }
          } else {
            console.log(`❌ ${student.name}: API returned ${response.status}`);
            delete urls[student.id];
          }
        } catch (error) {
          console.log(`❌ ${student.name}: API error:`, error);
          delete urls[student.id];
        }
      }
    }
    
    setPhotoUrls(urls);
  };

  // Cleanup blob URLs when component unmounts or when photoUrls change
  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photoUrls]);

  const getProfilePhotoUrl = (student: Student): string | null => {
    return photoUrls[student.id] || null;
  };

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Reset password for ${student.name}? They will need to use the new temporary password.`)) {
      return;
    }
    
    setResettingPassword(student.id);
    try {
      const response = await authApi.resetStudentPassword(student.student!.id);
      if (response.data.success) {
        const newPassword = response.data.data.newPassword;
        toast.success(`New password for ${student.name}: ${newPassword}`, {
          duration: 10000,
          icon: '🔑'
        });
        fetchStudents();
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = !student.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${student.name}?`)) {
      return;
    }
    
    setUpdatingStatus(student.id);
    try {
      await authApi.updateStudentStatus(student.student!.id, newStatus);
      toast.success(`${student.name} ${action}d successfully`);
      fetchStudents();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update student status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading('Exporting students data...', { id: 'export' });
      const response = await authApi.exportStudentsData();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export completed!', { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', { id: 'export' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getGenderIcon = (gender?: string) => {
    switch(gender) {
      case 'MALE': return '👨';
      case 'FEMALE': return '👩';
      default: return '👤';
    }
  };

  const getBloodGroupColor = (bloodGroup?: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-700',
      'A-': 'bg-red-100 text-red-700',
      'B+': 'bg-blue-100 text-blue-700',
      'B-': 'bg-blue-100 text-blue-700',
      'O+': 'bg-green-100 text-green-700',
      'O-': 'bg-green-100 text-green-700',
      'AB+': 'bg-purple-100 text-purple-700',
      'AB-': 'bg-purple-100 text-purple-700',
    };
    return colors[bloodGroup || ''] || 'bg-gray-100 text-gray-700';
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  // Filter students based on all criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student?.parentPhone?.includes(searchTerm) ||
      student.student?.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student?.motherName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = filterGender === 'ALL' || student.student?.gender === filterGender;
    const matchesBloodGroup = filterBloodGroup === 'ALL' || student.student?.bloodGroup === filterBloodGroup;
    const matchesClass = filterClass === 'ALL' || student.student?.classId?.toString() === filterClass;
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && student.isActive) ||
      (filterStatus === 'INACTIVE' && !student.isActive);
    
    return matchesSearch && matchesGender && matchesBloodGroup && matchesClass && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <div className={`${color} rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-80">
              {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">{icon}</div>
      </div>
    </div>
  );

  const StudentDetailsModal = () => {
    if (!selectedStudent) return null;
    const s = selectedStudent;
    const details = s.student;
    const photoUrl = getProfilePhotoUrl(s);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header with Photo */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={s.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                    {getInitials(s.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{s.name}</h2>
                  <p className="text-blue-100 mt-1">Roll No: {details?.rollNumber || 'N/A'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {details?.class ? `${details.class.name} ${details.class.section}` : 'Class Not Assigned'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      s.isActive ? 'bg-green-500/30' : 'bg-red-500/30'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {s.isFirstLogin && (
                      <span className="px-2 py-0.5 bg-yellow-500/30 rounded-full text-xs flex items-center gap-1">
                        <AlertCircle size={10} /> First Login Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleToggleStatus(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                s.isActive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {s.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {s.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => handleResetPassword(s)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200"
            >
              <Lock size={16} />
              Reset Password
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify({ student: s, details }, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${s.name}_${details?.rollNumber}_details.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              <Download size={16} />
              Export JSON
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              <Printer size={16} />
              Print
            </button>
          </div>

          {/* Content Sections */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm font-medium">{formatDate(details?.dateOfBirth)}</p>
                  <p className="text-xs text-gray-400">{getAge(details?.dateOfBirth)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-medium">{getGenderIcon(details?.gender)} {details?.gender || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="text-sm font-medium">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getBloodGroupColor(details?.bloodGroup)}`}>
                      {details?.bloodGroup || 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Nationality</p>
                  <p className="text-sm font-medium">{details?.nationality || 'Indian'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Religion</p>
                  <p className="text-sm font-medium">{details?.religion || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Student Phone</p>
                  <p className="text-sm font-medium">{details?.phone || s.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-purple-500" />
                Parent / Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Father's Name</p>
                  <p className="text-sm font-semibold">{details?.fatherName || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mother's Name</p>
                  <p className="text-sm font-semibold">{details?.motherName || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Parent Phone</p>
                  <p className="text-sm font-medium">{details?.parentPhone || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500">Parent Email</p>
                  <p className="text-sm font-medium">{details?.parentEmail || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Home size={20} className="text-orange-500" />
                Address Information
              </h3>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800">{details?.address || 'No address provided'}</p>
                {(details?.city || details?.state) && (
                  <p className="text-sm text-gray-600 mt-2">
                    {details?.city}, {details?.state}
                  </p>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-green-500" />
                Academic Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Admission Date</p>
                  <p className="text-sm font-medium">{formatDate(details?.admissionDate)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Previous School</p>
                  <p className="text-sm font-medium">{details?.previousSchool || 'N/A'}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Previous Class</p>
                  <p className="text-sm font-medium">{details?.previousClass || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-indigo-500" />
                Account Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium truncate">{s.email}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium">{s.status}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium">{formatDate(s.createdAt)}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm font-medium">{formatDate(s.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StudentCard = ({ student }: { student: Student }) => {
    const photoUrl = getProfilePhotoUrl(student);

    return (
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        {/* Status Badge */}
        <div className="relative">
          <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
            student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {student.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {student.isActive ? 'Active' : 'Inactive'}
          </div>
          
          {/* Profile Image */}
          <div className="relative pt-6 pb-2 flex justify-center">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 group-hover:border-blue-300 transition-all duration-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(student.name)}
                </div>
              )}
              {student.isFirstLogin && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  First Login
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Student Name & Roll Number */}
          <h3 className="text-lg font-bold text-gray-800 text-center mb-1">{student.name}</h3>
          <p className="text-sm text-gray-500 text-center mb-3">
            Roll: {student.student?.rollNumber || 'N/A'}
          </p>

          {/* Class & Gender Badges */}
          <div className="flex justify-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {student.student?.class ? `${student.student.class.name} ${student.student.class.section}` : 'No Class'}
            </span>
            {student.student?.gender && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {student.student.gender}
              </span>
            )}
          </div>

          {/* Blood Group */}
          {student.student?.bloodGroup && (
            <div className="flex justify-center mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getBloodGroupColor(student.student.bloodGroup)}`}>
                <Droplet size={10} />
                Blood: {student.student.bloodGroup}
              </span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 text-sm border-t border-gray-100 pt-3 mt-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate text-xs">{student.email}</span>
            </div>
            {(student.student?.parentPhone || student.phone) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs">{student.student?.parentPhone || student.phone}</span>
              </div>
            )}
            {student.student?.fatherName && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Users size={12} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">Father: {student.student.fatherName}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedStudent(student);
                setShowDetailsModal(true);
              }}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={() => handleResetPassword(student)}
              disabled={resettingPassword === student.id}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all duration-200 text-sm disabled:opacity-50"
            >
              {resettingPassword === student.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Students', value: students.length, icon: <Users size={24} />, color: 'bg-gradient-to-r from-blue-500 to-blue-600', trend: 12 },
    { title: 'Active Students', value: students.filter(s => s.isActive).length, icon: <UserCheck size={24} />, color: 'bg-gradient-to-r from-green-500 to-green-600', trend: 8 },
    { title: 'Male/Female', value: `${students.filter(s => s.student?.gender === 'MALE').length}/${students.filter(s => s.student?.gender === 'FEMALE').length}`, icon: <Users size={24} />, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { title: 'New This Month', value: students.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: <CalendarIcon size={24} />, color: 'bg-gradient-to-r from-orange-500 to-orange-600', trend: -5 },
  ];

  const uniqueClasses = [...new Set(students.map(s => s.student?.classId).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-gray-500 mt-1">View and manage all students in the system</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={fetchStudents}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {(filterGender !== 'ALL' || filterBloodGroup !== 'ALL' || filterClass !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setFilterGender('ALL');
                  setFilterBloodGroup('ALL');
                  setFilterClass('ALL');
                  setFilterStatus('ALL');
                  setSearchTerm('');
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, roll, parent..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Students Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Loading students...</p>
            </div>
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <School size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No students found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500">
              Showing {paginatedStudents.length} of {filteredStudents.length} students
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {user?.role === 'SUPERADMIN' && (
          <div className="text-center text-sm text-gray-500 bg-white p-4 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-gray-100">
            <Shield size={16} />
            You are viewing this data as SuperAdmin. You can manage all students.
          </div>
        )}

        {showDetailsModal && <StudentDetailsModal />}
      </div>
    </div>
  );
};

export default Students;