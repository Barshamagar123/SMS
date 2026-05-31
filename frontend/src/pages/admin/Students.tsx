import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/api';
import CreateStudentModal from '../../components/admin/CreateStudentModal';
import { 
  Search, Eye, Mail, Phone, Calendar, 
  User, GraduationCap, AlertCircle, 
  ChevronLeft, ChevronRight, RefreshCw, X,
  School, Users, UserCheck, Home, 
  Download, Printer, CheckCircle, XCircle, Lock, Unlock,
  Filter, Loader2, Shield, Edit, Trash2, Plus, ArrowRight
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

const AdminStudents: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterGender, setFilterGender] = useState<string>('ALL');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const itemsPerPage = 10;

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await authApi.getSuperAdminStudents();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (student: Student): string | null => {
    const photoPath = student.student?.profilePhoto;
    if (photoPath) {
      return `${BASE_URL}${photoPath}`;
    }
    return null;
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
    return new Date(dateString).toLocaleDateString('en-IN');
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

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Reset password for ${student.name}? New temporary password will be generated.`)) return;
    
    setResettingPassword(student.id);
    try {
      const response = await authApi.resetStudentPassword(student.student!.id);
      if (response.data.success) {
        toast.success(`New password for ${student.name}: ${response.data.data.newPassword}`, { duration: 10000 });
        fetchStudents();
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = !student.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${student.name}?`)) return;
    
    setUpdatingStatus(student.id);
    try {
      await authApi.updateStudentStatus(student.student!.id, newStatus);
      toast.success(`${student.name} ${action}d successfully`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update status');
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student?.parentPhone?.includes(searchTerm) ||
      student.student?.fatherName?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const StudentTableRow = ({ student }: { student: Student }) => {
    const photoUrl = getPhotoUrl(student);
    const [imgError, setImgError] = useState(false);

    return (
      <tr className="border-t border-gray-100 hover:bg-gray-50 transition">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {photoUrl && !imgError ? (
              <img
                src={photoUrl}
                alt={student.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(student.name)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-500">Roll: {student.student?.rollNumber || 'N/A'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-600">{student.email}</p>
          <p className="text-xs text-gray-400">{student.student?.parentPhone || 'No phone'}</p>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-700">
            {student.student?.class ? `${student.student.class.name} ${student.student.class.section}` : 'Not Assigned'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getBloodGroupColor(student.student?.bloodGroup)}`}>
            {student.student?.bloodGroup || 'N/A'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {student.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedStudent(student);
                setShowDetailsModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleResetPassword(student)}
              disabled={resettingPassword === student.id}
              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition disabled:opacity-50"
              title="Reset Password"
            >
              {resettingPassword === student.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            </button>
            <button
              onClick={() => handleToggleStatus(student)}
              disabled={updatingStatus === student.id}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
              title={student.isActive ? 'Deactivate' : 'Activate'}
            >
              {student.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const StudentDetailsModal = () => {
    if (!selectedStudent) return null;
    const s = selectedStudent;
    const details = s.student;
    const photoUrl = getPhotoUrl(s);
    const [imgError, setImgError] = useState(false);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {photoUrl && !imgError ? (
                  <img
                    src={photoUrl}
                    alt={s.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(s.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{s.name}</h2>
                  <p className="text-blue-100 text-sm">Roll No: {details?.rollNumber || 'N/A'}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {details?.class ? `${details.class.name} ${details.class.section}` : 'Class Not Assigned'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium">{formatDate(details?.dateOfBirth)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium">{details?.gender || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Blood Group</p>
                <p className="text-sm font-medium">{details?.bloodGroup || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Father's Name</p>
                <p className="text-sm font-medium">{details?.fatherName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Mother's Name</p>
                <p className="text-sm font-medium">{details?.motherName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Parent Phone</p>
                <p className="text-sm font-medium">{details?.parentPhone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium">{details?.address || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Admission Date</p>
                <p className="text-sm font-medium">{formatDate(details?.admissionDate)}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
            <button
              onClick={() => handleToggleStatus(s)}
              className={`px-4 py-2 rounded-lg transition ${s.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {s.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => handleResetPassword(s)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Students', value: students.length, icon: <Users size={20} />, color: 'bg-blue-500' },
    { title: 'Active Students', value: students.filter(s => s.isActive).length, icon: <UserCheck size={20} />, color: 'bg-green-500' },
    { title: 'Male/Female', value: `${students.filter(s => s.student?.gender === 'MALE').length}/${students.filter(s => s.student?.gender === 'FEMALE').length}`, icon: <Users size={20} />, color: 'bg-purple-500' },
    { title: 'New This Month', value: students.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: <Calendar size={20} />, color: 'bg-orange-500' },
  ];

  const uniqueClasses = [...new Set(students.map(s => s.student?.classId).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all students - Add, Edit, Delete, Transfer, Reset Password</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Student
            </button>
            <button onClick={fetchStudents} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-white shadow-sm`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-2">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, roll number, or parent phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <select
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(classId => (
                  <option key={classId} value={classId}>
                    Class {classId}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <School size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No students found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <StudentTableRow key={student.id} student={student} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateStudentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchStudents}
          />
        )}
        {showDetailsModal && <StudentDetailsModal />}
      </div>
    </div>
  );
};

export default AdminStudents;