import React, { useEffect, useState } from 'react';
import { 
  Search, Eye, Edit, Trash2, X, RefreshCw, Plus,
  School, Users, BookOpen, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, XCircle, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateClassModal from '../../components/admin/CreateClassModal';

interface ClassProfile {
  id: number;
  name: string;
  section: string;
  displayName: string;
  studentCount?: number;
  subjectCount?: number;
  students?: any[];
  subjects?: any[];
  isActive?: boolean;
}

interface Class {
  id: number;
  name: string;
  section: string;
  displayName: string;
  studentCount?: number;
  subjectCount?: number;
  isActive?: boolean;
}

const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', section: '' });
  const [editLoading, setEditLoading] = useState(false);
  
  const itemsPerPage = 10;
  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const classList = data.data || [];
        setClasses(classList);
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classItem: Class) => {
    if (!confirm(`Delete ${classItem.displayName}? This will also delete all associated data.`)) return;
    
    setDeletingId(classItem.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/classes/${classItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Class deleted successfully');
        fetchClasses();
      } else {
        toast.error(data.message || 'Failed to delete class');
      }
    } catch (error) {
      toast.error('Failed to delete class');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setEditFormData({
      name: classItem.name,
      section: classItem.section
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateClass = async () => {
    if (!selectedClass) return;
    
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Class updated successfully');
        setShowEditModal(false);
        setSelectedClass(null);
        setEditFormData({ name: '', section: '' });
        fetchClasses();
      } else {
        toast.error(data.message || 'Failed to update class');
      }
    } catch (error) {
      toast.error('Failed to update class');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
  const totalSubjects = classes.reduce((sum, cls) => sum + (cls.subjectCount || 0), 0);

  const ClassTableRow = ({ classItem }: { classItem: Class }) => {
    return (
      <tr className="border-t border-gray-100 hover:bg-gray-50 transition">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              <School size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{classItem.name}</p>
              <p className="text-xs text-gray-500">ID: {classItem.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            Section {classItem.section}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-gray-800">{classItem.displayName}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{classItem.studentCount || 0} Students</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <BookOpen size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{classItem.subjectCount || 0} Subjects</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setSelectedClass(classItem); setShowDetailsModal(true); }} 
              className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => handleEditClass(classItem)} 
              className="p-1 text-green-600 hover:bg-green-50 rounded" 
              title="Edit Class"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={() => handleDeleteClass(classItem)} 
              disabled={deletingId === classItem.id}
              className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" 
              title="Delete Class"
            >
              {deletingId === classItem.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const ClassDetailsModal = () => {
    if (!selectedClass) return null;
    const cls = selectedClass;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <School size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{cls.displayName}</h2>
                  <p className="text-blue-100 text-sm">Class ID: {cls.id}</p>
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
                <p className="text-xs text-gray-500">Class Name</p>
                <p className="text-sm font-medium">{cls.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Section</p>
                <p className="text-sm font-medium">{cls.section}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Display Name</p>
                <p className="text-sm font-medium">{cls.displayName}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-sm font-medium">{cls.studentCount || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Subjects</p>
                <p className="text-sm font-medium">{cls.subjectCount || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Status</p>
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
            <button 
              onClick={() => { setShowDetailsModal(false); handleEditClass(cls); }} 
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg"
            >
              Edit Class
            </button>
            <button 
              onClick={() => { setShowDetailsModal(false); handleDeleteClass(cls); }} 
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg"
            >
              Delete Class
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditClassModal = () => {
    if (!showEditModal || !selectedClass) return null;

    const gradeOptions = [
      'Nursery', 'LKG', 'UKG',
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
      'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
      'Grade 11', 'Grade 12'
    ];

    const sectionOptions = ['A', 'B', 'C', 'D', 'E'];

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Class</h2>
                <p className="text-blue-100 text-sm mt-1">Update class information</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
              <select
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <select
                name="section"
                value={editFormData.section}
                onChange={handleEditChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Section</option>
                {sectionOptions.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> {editFormData.name && editFormData.section 
                  ? `${editFormData.name} - Section ${editFormData.section}`
                  : 'Select class and section'}
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
                onClick={handleUpdateClass}
                disabled={editLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {editLoading ? <Loader2 size={18} className="animate-spin" /> : <School size={18} />}
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Classes', value: classes.length, icon: <School size={20} />, color: 'bg-blue-500' },
    { title: 'Total Sections', value: classes.length, icon: <Users size={20} />, color: 'bg-green-500' },
    { title: 'Total Students', value: totalStudents, icon: <Users size={20} />, color: 'bg-purple-500' },
    { title: 'Total Subjects', value: totalSubjects, icon: <BookOpen size={20} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage classes, sections, and assignments</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Class
            </button>
            <button 
              onClick={fetchClasses} 
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

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search classes by name or section..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Classes Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : paginatedClasses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <School size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No classes found</p>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add your first class
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Display Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClasses.map((classItem) => (
                      <ClassTableRow key={classItem.id} classItem={classItem} />
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
                          ? 'bg-blue-600 text-white'
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
        <CreateClassModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchClasses} 
        />
      )}
      {showDetailsModal && <ClassDetailsModal />}
      {showEditModal && <EditClassModal />}
    </div>
  );
};

export default AdminClasses;