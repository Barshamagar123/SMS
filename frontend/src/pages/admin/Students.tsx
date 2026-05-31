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
  Filter, Loader2, Shield, Edit, Trash2, Plus,
  Copy, Check, Save
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterBloodGroup, setFilterBloodGroup] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState<{ name: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const itemsPerPage = 10;

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Reset password for ${student.name}? New temporary password will be generated.`)) return;
    
    setResettingPassword(student.id);
    toast.loading('Generating new password...', { id: 'reset-pwd' });
    
    try {
      const response = await authApi.resetStudentPassword(student.student!.id);
      toast.dismiss('reset-pwd');
      
      if (response.data.success) {
        const newPassword = response.data.data.newPassword;
        setNewPasswordData({
          name: student.name,
          password: newPassword
        });
        setShowPasswordModal(true);
        toast.success(`New password generated for ${student.name}!`);
        fetchStudents();
      }
    } catch (error: any) {
      toast.dismiss('reset-pwd');
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    const newStatus = !student.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    const message = newStatus 
      ? `Activate ${student.name}? They will be able to login again.`
      : `Deactivate ${student.name}? Their data will be preserved.`;
    
    if (!confirm(message)) return;
    
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

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      studentId: student.student?.id,
      classId: student.student?.classId || '',
      dateOfBirth: student.student?.dateOfBirth || '',
      gender: student.student?.gender || 'MALE',
      fatherName: student.student?.fatherName || '',
      motherName: student.student?.motherName || '',
      parentPhone: student.student?.parentPhone || '',
      address: student.student?.address || '',
      city: student.student?.city || '',
      state: student.student?.state || '',
      bloodGroup: student.student?.bloodGroup || '',
      parentEmail: student.student?.parentEmail || '',
      nationality: student.student?.nationality || 'Indian',
      religion: student.student?.religion || '',
      admissionDate: student.student?.admissionDate || '',
      previousSchool: student.student?.previousSchool || '',
      previousClass: student.student?.previousClass || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    
    setEditLoading(true);
    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        classId: parseInt(editFormData.classId),
        dateOfBirth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        fatherName: editFormData.fatherName,
        motherName: editFormData.motherName,
        parentPhone: editFormData.parentPhone,
        address: editFormData.address,
        city: editFormData.city,
        state: editFormData.state,
        bloodGroup: editFormData.bloodGroup,
        parentEmail: editFormData.parentEmail,
        nationality: editFormData.nationality,
        religion: editFormData.religion,
        admissionDate: editFormData.admissionDate,
        previousSchool: editFormData.previousSchool,
        previousClass: editFormData.previousClass
      };
      
      const response = await authApi.updateStudent(selectedStudent.student!.id, updateData);
      if (response.data.success) {
        toast.success('Student updated successfully');
        setShowEditModal(false);
        setSelectedStudent(null);
        setEditFormData({});
        fetchStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setEditLoading(false);
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
      toast.error('Export failed', { id: 'export' });
    }
  };

  const filteredStudents = students.filter(student => {
    if (showActiveOnly && !student.isActive) return false;
    
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.student?.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.student?.parentPhone || '').includes(searchTerm);
    
    const matchesGender = filterGender === 'ALL' || student.student?.gender === filterGender;
    const matchesBloodGroup = filterBloodGroup === 'ALL' || student.student?.bloodGroup === filterBloodGroup;
    const matchesClass = filterClass === 'ALL' || student.student?.classId?.toString() === filterClass;
    
    return matchesSearch && matchesGender && matchesBloodGroup && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = students.filter(s => s.isActive).length;
  const inactiveCount = students.filter(s => !s.isActive).length;

  // Get unique classes
  const uniqueClasses: number[] = [];
  students.forEach(student => {
    const classId = student.student?.classId;
    if (classId && !uniqueClasses.includes(classId)) {
      uniqueClasses.push(classId);
    }
  });

  const StudentTableRow = ({ student }: { student: Student }) => {
    const photoUrl = getPhotoUrl(student);
    const [imgError, setImgError] = useState(false);

    return (
      <tr className={`border-t border-gray-100 hover:bg-gray-50 transition ${!student.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
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
          {student.student?.class ? `${student.student.class.name} ${student.student.class.section}` : 'Not Assigned'}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getBloodGroupColor(student.student?.bloodGroup)}`}>
            {student.student?.bloodGroup || 'N/A'}
          </span>
        </td>
        <td className="px-4 py-3">
          {student.isActive ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Inactive</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => { setSelectedStudent(student); setShowDetailsModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
              <Eye size={16} />
            </button>
            <button onClick={() => handleEditStudent(student)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit Student">
              <Edit size={14} />
            </button>
            <button onClick={() => handleResetPassword(student)} disabled={resettingPassword === student.id} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded disabled:opacity-50" title="Reset Password">
              {resettingPassword === student.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            </button>
            <button onClick={() => handleToggleStatus(student)} disabled={updatingStatus === student.id} className={`p-1 rounded ${student.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={student.isActive ? 'Deactivate' : 'Activate'}>
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
                  <img src={photoUrl} alt={s.name} className="w-20 h-20 rounded-full object-cover border-4 border-white/30" onError={() => setImgError(true)} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(s.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{s.name}</h2>
                  <p className="text-blue-100 text-sm">Roll No: {details?.rollNumber || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
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
            <button onClick={() => { setShowDetailsModal(false); handleEditStudent(s); }} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              Edit Student
            </button>
            <button onClick={() => { setShowDetailsModal(false); handleResetPassword(s); }} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
              Reset Password
            </button>
            <button onClick={() => handleToggleStatus(s)} className={`px-4 py-2 rounded-lg ${s.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {s.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditStudentModal = () => {
    if (!showEditModal || !selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Student</h2>
                <p className="text-blue-100 text-sm mt-1">Update student information</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                <select
                  name="classId"
                  value={editFormData.classId || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.displayName || `${cls.name} ${cls.section}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editFormData.dateOfBirth || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={editFormData.gender || 'MALE'}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={editFormData.bloodGroup || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={editFormData.fatherName || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={editFormData.motherName || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={editFormData.parentPhone || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  name="parentEmail"
                  value={editFormData.parentEmail || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={editFormData.address || ''}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={editFormData.city || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={editFormData.state || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={editFormData.admissionDate || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                <input
                  type="text"
                  name="previousSchool"
                  value={editFormData.previousSchool || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Class</label>
                <input
                  type="text"
                  name="previousClass"
                  value={editFormData.previousClass || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={editFormData.nationality || 'Indian'}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  name="religion"
                  value={editFormData.religion || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStudent}
                disabled={editLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {editLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PasswordResetModal = () => {
    if (!showPasswordModal || !newPasswordData) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-5 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Lock size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Password Reset</h3>
                <p className="text-yellow-100 text-sm">New password generated</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="text-lg font-semibold text-gray-800">{newPasswordData.name}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">Temporary Password</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono font-bold text-gray-800 bg-white px-3 py-2 rounded-lg flex-1 text-center">
                  {showPassword ? newPasswordData.password : '••••••••••••'}
                </code>
                <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  {showPassword ? <Eye size={18} /> : <Lock size={18} />}
                </button>
                <button onClick={() => copyToClipboard(newPasswordData.password)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border-t p-5 flex justify-end">
            <button onClick={() => { setShowPasswordModal(false); setNewPasswordData(null); setCopied(false); setShowPassword(false); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Students', value: students.length, icon: <Users size={20} />, color: 'bg-blue-500' },
    { title: 'Active Students', value: activeCount, icon: <UserCheck size={20} />, color: 'bg-green-500' },
    { title: 'Inactive Students', value: inactiveCount, icon: <UserCheck size={20} />, color: 'bg-gray-500' },
    { title: 'Male/Female', value: `${students.filter(s => s.student?.gender === 'MALE').length}/${students.filter(s => s.student?.gender === 'FEMALE').length}`, icon: <Users size={20} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all students</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">Export CSV</button>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">Add Student</button>
            <button onClick={fetchStudents} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-white shadow-sm`}>
              <div className="flex justify-between items-center">
                <div><p className="text-sm opacity-80">{stat.title}</p><p className="text-2xl font-bold">{stat.value}</p></div>
                <div className="bg-white/20 rounded-full p-2">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex gap-4">
            <button onClick={() => { setShowActiveOnly(true); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg ${showActiveOnly ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Active Students ({activeCount})</button>
            <button onClick={() => { setShowActiveOnly(false); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg ${!showActiveOnly ? 'bg-gray-600 text-white' : 'bg-gray-100'}`}>Inactive Students ({inactiveCount})</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder={`Search ${showActiveOnly ? 'active' : 'inactive'} students...`} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={48} className="animate-spin text-blue-500" /></div>
        ) : paginatedStudents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl"><School size={64} className="mx-auto text-gray-300 mb-3" /><p>No students found</p></div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Contact</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Blood</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (<StudentTableRow key={student.id} student={student} />))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded-lg">Previous</button>
                <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded-lg">Next</button>
              </div>
            )}
          </>
        )}

        {showCreateModal && <CreateStudentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchStudents} />}
        {showDetailsModal && <StudentDetailsModal />}
        {showEditModal && <EditStudentModal />}
        {showPasswordModal && <PasswordResetModal />}
      </div>
    </div>
  );
};

export default AdminStudents;