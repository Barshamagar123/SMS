import React, { useEffect, useState } from 'react';
import { 
  Search, Eye, Edit, Trash2, X, RefreshCw, Plus,
  BookOpen, Code, FileText, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, XCircle, Save, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateSubjectModal from '../../components/admin/CreateSubjectModal';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.data || []);
      } else {
        toast.error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Delete ${subject.name}? This will also remove it from all classes.`)) return;
    
    setDeletingId(subject.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/subjects/${subject.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } else {
        toast.error(data.message || 'Failed to delete subject');
      }
    } catch (error) {
      toast.error('Failed to delete subject');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setEditFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubject = async () => {
    if (!selectedSubject) return;
    
    if (!editFormData.name.trim() || !editFormData.code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/subjects/${selectedSubject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          code: editFormData.code.trim().toUpperCase(),
          description: editFormData.description || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Subject updated successfully');
        setShowEditModal(false);
        setSelectedSubject(null);
        setEditFormData({ name: '', code: '', description: '' });
        fetchSubjects();
      } else {
        toast.error(data.message || 'Failed to update subject');
      }
    } catch (error) {
      toast.error('Failed to update subject');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    if (showActiveOnly && !subject.isActive) return false;
    
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = subjects.filter(s => s.isActive).length;
  const inactiveCount = subjects.filter(s => !s.isActive).length;

  const SubjectTableRow = ({ subject }: { subject: Subject }) => {
    return (
      <tr className={`border-t border-gray-100 hover:bg-gray-50 transition ${!subject.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              <BookOpen size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{subject.name}</p>
              <p className="text-xs text-gray-500">ID: {subject.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="px-2 py-1 bg-gray-100 font-mono text-xs text-gray-700 rounded">
            {subject.code}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-600 max-w-xs truncate">
            {subject.description || 'No description'}
          </p>
        </td>
        <td className="px-4 py-3">
          {subject.isActive ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Inactive</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSelectedSubject(subject); setShowDetailsModal(true); }} 
              className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => handleEditSubject(subject)} 
              className="p-1 text-green-600 hover:bg-green-50 rounded" 
              title="Edit Subject"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={() => handleDeleteSubject(subject)} 
              disabled={deletingId === subject.id}
              className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" 
              title="Delete Subject"
            >
              {deletingId === subject.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const SubjectDetailsModal = () => {
    if (!selectedSubject) return null;
    const s = selectedSubject;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{s.name}</h2>
                  <p className="text-green-100 text-sm">Code: {s.code}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Subject Name</p>
                <p className="text-sm font-medium">{s.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Subject Code</p>
                <p className="text-sm font-medium font-mono">{s.code}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm font-medium">{s.description || 'No description provided'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-medium">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
            <button 
              onClick={() => { setShowDetailsModal(false); handleEditSubject(s); }} 
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg"
            >
              Edit Subject
            </button>
            <button 
              onClick={() => { setShowDetailsModal(false); handleDeleteSubject(s); }} 
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg"
            >
              Delete Subject
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditSubjectModal = () => {
    if (!showEditModal || !selectedSubject) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Subject</h2>
                <p className="text-green-100 text-sm mt-1">Update subject information</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="e.g., Mathematics, Science, English"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={editFormData.code}
                onChange={handleEditChange}
                placeholder="e.g., MATH101, SCI202, ENG301"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows={3}
                placeholder="Brief description of the subject..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changing the subject code may affect existing class assignments.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubject}
                disabled={editLoading}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
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
    { title: 'Total Subjects', value: subjects.length, icon: <BookOpen size={20} />, color: 'bg-green-500' },
    { title: 'Active Subjects', value: activeCount, icon: <CheckCircle size={20} />, color: 'bg-emerald-500' },
    { title: 'Inactive Subjects', value: inactiveCount, icon: <XCircle size={20} />, color: 'bg-gray-500' },
    { title: 'Total Codes', value: subjects.length, icon: <Code size={20} />, color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all subjects and their assignments</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={18} />
              Add Subject
            </button>
            <button 
              onClick={fetchSubjects} 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition"
            >
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

        {/* Toggle Buttons */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex gap-4">
            <button 
              onClick={() => { setShowActiveOnly(true); setCurrentPage(1); }} 
              className={`px-4 py-2 rounded-lg transition ${showActiveOnly ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Active Subjects ({activeCount})
            </button>
            <button 
              onClick={() => { setShowActiveOnly(false); setCurrentPage(1); }} 
              className={`px-4 py-2 rounded-lg transition ${!showActiveOnly ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Inactive Subjects ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${showActiveOnly ? 'active' : 'inactive'} subjects by name, code or description...`} 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Subjects Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-green-500" />
          </div>
        ) : paginatedSubjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No subjects found</p>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add your first subject
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubjects.map((subject) => (
                      <SubjectTableRow key={subject.id} subject={subject} />
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
                  className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'bg-white border hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateSubjectModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchSubjects} 
        />
      )}
      {showDetailsModal && <SubjectDetailsModal />}
      {showEditModal && <EditSubjectModal />}
    </div>
  );
};

export default AdminSubjects;