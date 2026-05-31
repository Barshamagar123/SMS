import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/api';
import CreateTeacherModal from '../../components/admin/CreateTeacherModal';
import { 
  Search, Eye, Mail, Phone, Calendar, 
  User, GraduationCap, 
  ChevronLeft, ChevronRight, RefreshCw, X,
  School, Users, UserCheck, 
  Download, Printer, CheckCircle, XCircle, Lock, Unlock,
  Filter, Loader2, Shield, Edit, Plus,
  Briefcase, Save, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Teacher {
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
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  address?: string;
  hireDate?: string;
  profilePhoto?: string;
  assignments?: any[];
}

const AdminTeachers: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Teacher>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState<{ name: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const itemsPerPage = 10;

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await authApi.getAllTeachers();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (teacher: Teacher): string | null => {
    const photoPath = teacher.profilePhoto;
    if (photoPath) {
      return `${BASE_URL}${photoPath}`;
    }
    return null;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
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

  const handleResetPassword = async (teacher: Teacher): Promise<void> => {
    if (!confirm(`Reset password for ${teacher.name}? A new temporary password will be generated.`)) return;
    
    setResettingPassword(teacher.id);
    toast.loading('Generating new password...', { id: 'reset-pwd' });
    
    try {
      const response = await authApi.resetTeacherPassword(teacher.id);
      toast.dismiss('reset-pwd');
      
      if (response.data.success) {
        const newPassword = response.data.data.newPassword;
        setNewPasswordData({
          name: teacher.name,
          password: newPassword
        });
        setShowPasswordModal(true);
        toast.success(`New password generated for ${teacher.name}!`);
        fetchTeachers();
      }
    } catch (error: any) {
      toast.dismiss('reset-pwd');
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleToggleStatus = async (teacher: Teacher): Promise<void> => {
    const newStatus = !teacher.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    const message = newStatus 
      ? `Activate ${teacher.name}? They will be able to login again.`
      : `Deactivate ${teacher.name}? They will no longer be able to login.`;
    
    if (!confirm(message)) return;
    
    setUpdatingStatus(teacher.id);
    try {
      await authApi.updateTeacherStatus(teacher.id, newStatus);
      toast.success(`${teacher.name} ${action}d successfully`);
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditTeacher = (teacher: Teacher): void => {
    setSelectedTeacher(teacher);
    setEditFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      address: teacher.address || '',
      hireDate: teacher.hireDate ? teacher.hireDate.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setEditFormData((prev: Partial<Teacher>) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTeacher = async (): Promise<void> => {
    if (!selectedTeacher) return;
    
    setEditLoading(true);
    try {
      const response = await authApi.updateTeacher(selectedTeacher.id, editFormData);
      if (response.data.success) {
        toast.success('Teacher updated successfully');
        setShowEditModal(false);
        setSelectedTeacher(null);
        setEditFormData({});
        fetchTeachers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update teacher');
    } finally {
      setEditLoading(false);
    }
  };

  const handleExportData = async (): Promise<void> => {
    try {
      toast.loading('Exporting teachers data...', { id: 'export' });
      
      const headers: string[] = ['Name', 'Email', 'Phone', 'Employee ID', 'Qualification', 'Specialization', 'Address', 'Hire Date', 'Status'];
      const rows: string[][] = teachers.map((t: Teacher) => [
        t.name,
        t.email,
        t.phone || '',
        t.employeeId || '',
        t.qualification || '',
        t.specialization || '',
        t.address || '',
        formatDate(t.hireDate),
        t.isActive ? 'Active' : 'Inactive'
      ]);
      
      const csvContent: string = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
      const blob: Blob = new Blob([csvContent], { type: 'text/csv' });
      const url: string = window.URL.createObjectURL(blob);
      const link: HTMLAnchorElement = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
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

  const filteredTeachers: Teacher[] = teachers.filter((teacher: Teacher) => {
    if (filterStatus === 'ACTIVE' && !teacher.isActive) return false;
    if (filterStatus === 'INACTIVE' && teacher.isActive) return false;
    
    const matchesSearch: boolean = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages: number = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers: Teacher[] = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount: number = teachers.filter((t: Teacher) => t.isActive).length;
  const inactiveCount: number = teachers.filter((t: Teacher) => !t.isActive).length;

  const PasswordResetModal: React.FC = () => {
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
              <p className="text-sm text-gray-600 mb-1">Teacher Name</p>
              <p className="text-lg font-semibold text-gray-800">{newPasswordData.name}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">🔑 Temporary Password</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-lg font-mono font-bold text-gray-800 bg-white px-3 py-2 rounded-lg flex-1 text-center">
                  {showPassword ? newPasswordData.password : '••••••••••••'}
                </code>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  type="button"
                >
                  {showPassword ? <Eye size={18} /> : <Lock size={18} />}
                </button>
                <button
                  onClick={() => copyToClipboard(newPasswordData.password)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                  type="button"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                ⚠️ Please share this password with the teacher.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border-t p-5 flex justify-end rounded-b-2xl">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setNewPasswordData(null);
                setCopied(false);
                setShowPassword(false);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TeacherTableRow: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const photoUrl: string | null = getPhotoUrl(teacher);
    const [imgError, setImgError] = useState<boolean>(false);

    return (
      <tr className={`border-t border-gray-100 hover:bg-gray-50 transition ${!teacher.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {photoUrl && !imgError ? (
              <img
                src={photoUrl}
                alt={teacher.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(teacher.name)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
              <p className="text-xs text-gray-500">ID: {teacher.employeeId || 'N/A'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-600">{teacher.email}</p>
          <p className="text-xs text-gray-400">{teacher.phone || 'No phone'}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-700">{teacher.specialization || 'General'}</p>
          <p className="text-xs text-gray-400">{teacher.qualification || 'N/A'}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-700">{formatDate(teacher.hireDate)}</p>
        </td>
        <td className="px-4 py-3">
          {teacher.isActive ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Active
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 flex items-center gap-1 w-fit">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Inactive
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTeacher(teacher);
                setShowDetailsModal(true);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleEditTeacher(teacher)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition"
              title="Edit Teacher"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleResetPassword(teacher)}
              disabled={resettingPassword === teacher.id}
              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition disabled:opacity-50"
              title="Reset Password"
            >
              {resettingPassword === teacher.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            </button>
            <button
              onClick={() => handleToggleStatus(teacher)}
              disabled={updatingStatus === teacher.id}
              className={`p-1 rounded transition disabled:opacity-50 ${teacher.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              title={teacher.isActive ? 'Deactivate Teacher' : 'Activate Teacher'}
            >
              {teacher.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const TeacherDetailsModal: React.FC = () => {
    if (!selectedTeacher) return null;
    const t: Teacher = selectedTeacher;
    const photoUrl: string | null = getPhotoUrl(t);
    const [imgError, setImgError] = useState<boolean>(false);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {photoUrl && !imgError ? (
                  <img
                    src={photoUrl}
                    alt={t.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(t.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{t.name}</h2>
                  <p className="text-purple-100 text-sm">Employee ID: {t.employeeId || 'N/A'}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {t.specialization || 'General'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${t.isActive ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
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
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{t.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{t.email}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{t.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Qualification</p>
                <p className="text-sm font-medium">{t.qualification || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Specialization</p>
                <p className="text-sm font-medium">{t.specialization || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Hire Date</p>
                <p className="text-sm font-medium">{formatDate(t.hireDate)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium">{t.address || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium">{t.status}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                handleEditTeacher(t);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <Edit size={16} />
              Edit Profile
            </button>
            <button
              onClick={() => handleToggleStatus(t)}
              className={`px-4 py-2 rounded-lg ${t.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
            >
              {t.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                handleResetPassword(t);
              }}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditTeacherModal: React.FC = () => {
    if (!showEditModal || !selectedTeacher) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => {
        if (e.target === e.currentTarget) setShowEditModal(false);
      }}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Teacher</h2>
                <p className="text-purple-100 text-sm mt-1">Update teacher information</p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="teacher@school.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={editFormData.qualification || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="e.g., M.Ed, B.Ed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={editFormData.specialization || ''}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="e.g., Mathematics, Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  type="date"
                  name="hireDate"
                  value={editFormData.hireDate || ''}
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
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Complete address"
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
                onClick={handleUpdateTeacher}
                disabled={editLoading}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
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

  const stats = [
    { title: 'Total Teachers', value: teachers.length, icon: <Users size={20} />, color: 'bg-purple-500' },
    { title: 'Active Teachers', value: activeCount, icon: <UserCheck size={20} />, color: 'bg-green-500' },
    { title: 'Inactive Teachers', value: inactiveCount, icon: <UserCheck size={20} />, color: 'bg-gray-500' },
    { title: 'Departments', value: [...new Set(teachers.map(t => t.specialization))].filter(Boolean).length, icon: <Briefcase size={20} />, color: 'bg-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all teachers - Add, Edit, Deactivate, Reset Password</p>
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              Add Teacher
            </button>
            <button onClick={fetchTeachers} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition">
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

        {/* Active/Inactive Toggle & Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterStatus('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  filterStatus === 'ACTIVE' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserCheck size={16} />
                Active Teachers ({activeCount})
              </button>
              <button
                onClick={() => {
                  setFilterStatus('INACTIVE');
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  filterStatus === 'INACTIVE' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle size={16} />
                Inactive Teachers ({inactiveCount})
              </button>
            </div>
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${filterStatus === 'ACTIVE' ? 'active' : 'inactive'} teachers...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={48} className="animate-spin text-purple-500" />
          </div>
        ) : paginatedTeachers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <School size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No {filterStatus === 'ACTIVE' ? 'active' : 'inactive'} teachers found</p>
            {teachers.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Create your first teacher
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hire Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.map((teacher) => (
                      <TeacherTableRow key={teacher.id} teacher={teacher} />
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
                  className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        {user?.role === 'ADMIN' && (
          <div className="text-center text-sm text-gray-500 bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 border border-gray-100">
            <Shield size={16} />
            You are viewing as Admin. You can manage all teachers.
          </div>
        )}

        {/* Modals */}
        {showDetailsModal && <TeacherDetailsModal />}
        {showEditModal && <EditTeacherModal />}
        {showCreateModal && (
          <CreateTeacherModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchTeachers}
          />
        )}
        {showPasswordModal && <PasswordResetModal />}
      </div>
    </div>
  );
};

export default AdminTeachers;