import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/api';
import { 
  Search, Eye, Mail, Phone, Calendar, 
  User, GraduationCap, AlertCircle, 
  ChevronLeft, ChevronRight, RefreshCw, X,
  School, Users, UserCheck, Home, 
  Download, Printer, CheckCircle, XCircle, Lock, Unlock,
  Filter, Loader2, Shield, TrendingUp, TrendingDown, Briefcase, MapPin,
  Upload, Image as ImageIcon
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
  // These come directly from the teacher profile
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  address?: string;
  hireDate?: string;
  profilePhoto?: string;
  assignments?: any[];
}

const Teachers: React.FC = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [resettingPassword, setResettingPassword] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const itemsPerPage = 9;

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await authApi.getAllTeachers();
      if (response.data.success) {
        console.log('Teachers data:', response.data.data);
        setTeachers(response.data.data);
        // Load photos after teachers are loaded
        await loadAllTeacherPhotos(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Load photos using static URLs from profilePhoto field
  const loadAllTeacherPhotos = async (teachersData: Teacher[]) => {
    for (const teacher of teachersData) {
      const profilePhoto = teacher.profilePhoto; // DIRECT ACCESS - NOT teacher.teacher
      
      if (profilePhoto) {
        // Construct static URL
        let staticUrl = profilePhoto;
        if (!staticUrl.startsWith('http')) {
          staticUrl = `${BASE_URL}${staticUrl.startsWith('/') ? '' : '/'}${staticUrl}`;
        }
        
        console.log(`📸 Loading photo for ${teacher.name}: ${staticUrl}`);
        
        // Preload image
        const img = new Image();
        img.onload = () => {
          setPhotoUrls(prev => ({ ...prev, [teacher.id]: staticUrl }));
          console.log(`✅ Photo loaded for: ${teacher.name}`);
        };
        img.onerror = () => {
          console.log(`❌ Image not found for: ${teacher.name} at ${staticUrl}`);
        };
        img.src = staticUrl;
      } else {
        console.log(`📷 No photo in database for: ${teacher.name}`);
      }
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
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleResetPassword = async (teacher: Teacher) => {
    if (!confirm(`Reset password for ${teacher.name}?`)) return;
    
    setResettingPassword(teacher.id);
    try {
      const response = await authApi.resetTeacherPassword(teacher.id);
      if (response.data.success) {
        toast.success(`New password: ${response.data.data.newPassword}`, { duration: 10000 });
        fetchTeachers();
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    const newStatus = !teacher.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!confirm(`${action} ${teacher.name}?`)) return;
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const response = await authApi.uploadTeacherPhoto(selectedFile);
      if (response.data.success) {
        toast.success('Photo uploaded successfully');
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchTeachers();
      }
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && teacher.isActive) ||
      (filterStatus === 'INACTIVE' && !teacher.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
    const photoUrl = photoUrls[teacher.id];

    return (
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative">
          <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
            teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {teacher.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {teacher.isActive ? 'Active' : 'Inactive'}
          </div>
          
          <button
            onClick={() => {
              setSelectedTeacher(teacher);
              setShowUploadModal(true);
            }}
            className="absolute top-3 left-3 z-10 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-purple-50"
            title="Upload Photo"
          >
            <Upload size={14} className="text-purple-600" />
          </button>
          
          <div className="pt-6 pb-2 flex justify-center">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={teacher.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 group-hover:border-purple-300 transition-all"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(teacher.name)}
                </div>
              )}
              {teacher.isFirstLogin && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-800 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  First Login
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 pt-6">
          <h3 className="text-lg font-bold text-gray-800 text-center mb-1">{teacher.name}</h3>
          <p className="text-sm text-purple-600 text-center mb-2">
            ID: {teacher.employeeId || 'N/A'}
          </p>

          <div className="flex justify-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              {teacher.specialization || 'General'}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {teacher.qualification || 'N/A'}
            </span>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-3 mt-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate text-xs">{teacher.email}</span>
            </div>
            {teacher.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs">{teacher.phone}</span>
              </div>
            )}
            {teacher.hireDate && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                <span>Joined: {formatDate(teacher.hireDate)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedTeacher(teacher);
                setShowDetailsModal(true);
              }}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={() => handleResetPassword(teacher)}
              disabled={resettingPassword === teacher.id}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-sm disabled:opacity-50"
            >
              {resettingPassword === teacher.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TeacherDetailsModal = () => {
    if (!selectedTeacher) return null;
    const t = selectedTeacher;
    const photoUrl = photoUrls[t.id];

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={t.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(t.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{t.name}</h2>
                  <p className="text-purple-100 text-sm">ID: {t.employeeId || 'N/A'}</p>
                  <div className="flex gap-2 mt-1">
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
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-medium">{formatDate(t.createdAt)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Last Login</p>
                <p className="text-sm font-medium">{formatDate(t.lastLoginAt)}</p>
              </div>
            </div>

            {/* Assignments Section */}
            {t.assignments && t.assignments.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-purple-500" />
                  Current Assignments
                </h3>
                <div className="space-y-2">
                  {t.assignments.map((assignment: any, idx: number) => (
                    <div key={idx} className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">
                        {assignment.class} - {assignment.subject}
                        {assignment.isPrimary && (
                          <span className="ml-2 text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">Primary</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Academic Year: {assignment.academicYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setSelectedTeacher(t);
                setShowUploadModal(true);
                setShowDetailsModal(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Upload size={16} />
              Change Photo
            </button>
            <button
              onClick={() => handleToggleStatus(t)}
              disabled={updatingStatus === t.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                t.isActive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {updatingStatus === t.id ? <Loader2 size={16} className="animate-spin" /> : (t.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />)}
              {t.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => handleResetPassword(t)}
              disabled={resettingPassword === t.id}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
            >
              {resettingPassword === t.id ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Reset Password
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UploadPhotoModal = () => {
    if (!selectedTeacher) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }}>
        <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">Upload Photo</h3>
            <p className="text-sm text-gray-500">For: {selectedTeacher.name}</p>
          </div>
          
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <>
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                  <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t flex justify-end gap-3">
            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
            <button onClick={handleUpload} disabled={!selectedFile || uploading} className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Teachers', value: teachers.length, icon: <Users size={24} />, color: 'bg-purple-500' },
    { title: 'Active Teachers', value: teachers.filter(t => t.isActive).length, icon: <UserCheck size={24} />, color: 'bg-green-500' },
    { title: 'New This Month', value: teachers.filter(t => new Date(t.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: <Calendar size={24} />, color: 'bg-orange-500' },
    { title: 'Departments', value: [...new Set(teachers.map(t => t.specialization))].filter(Boolean).length, icon: <Briefcase size={24} />, color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Management</h1>
          <button onClick={fetchTeachers} className="px-4 py-2 bg-white rounded-lg shadow-sm border">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-5 text-white`}>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm opacity-80">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-2">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={48} className="animate-spin text-purple-500" /></div>
        ) : paginatedTeachers.length === 0 ? (
          <div className="text-center py-20"><School size={64} className="mx-auto text-gray-300" /><p>No teachers found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedTeachers.map((teacher) => (<TeacherCard key={teacher.id} teacher={teacher} />))}
          </div>
        )}

        {user?.role === 'SUPERADMIN' && (
          <div className="text-center text-sm text-gray-500 bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2">
            <Shield size={16} />
            You are viewing as SuperAdmin. You can manage all teachers.
          </div>
        )}

        {showDetailsModal && <TeacherDetailsModal />}
        {showUploadModal && <UploadPhotoModal />}
      </div>
    </div>
  );
};

export default Teachers;