import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, RefreshCw,
  Calendar, CheckCircle, XCircle, Loader2,
  ChevronLeft, ChevronRight, AlertCircle,
  CalendarDays, Award, TrendingUp, Save,
  Eye, Star, StarOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AcademicYear {
  id: number;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

const AdminAcademicYears: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [filteredYears, setFilteredYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isActive: false
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    filterYears();
  }, [searchTerm, academicYears]);

  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/academic-years', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAcademicYears(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch academic years');
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/academic-years', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: formData.year,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Academic year created successfully');
        setFormData({ year: '', startDate: '', endDate: '', isActive: false });
        setShowAddModal(false);
        fetchAcademicYears();
      } else {
        toast.error(data.message || 'Failed to create academic year');
      }
    } catch (error) {
      console.error('Failed to create academic year:', error);
      toast.error('Failed to create academic year');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedYear) return;
    if (!formData.year || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/teacher-assignments/academic-years/${selectedYear.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: formData.year,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Academic year updated successfully');
        setShowEditModal(false);
        setSelectedYear(null);
        setFormData({ year: '', startDate: '', endDate: '', isActive: false });
        fetchAcademicYears();
      } else {
        toast.error(data.message || 'Failed to update academic year');
      }
    } catch (error) {
      console.error('Failed to update academic year:', error);
      toast.error('Failed to update academic year');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSetActiveYear = async (year: AcademicYear) => {
    if (year.isActive) {
      toast.error(`${year.year} is already active`);
      return;
    }
    
    if (!confirm(`Set ${year.year} as the active academic year? This will deactivate the current active year.`)) return;
    
    setActionLoading(year.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/teacher-assignments/academic-years/${year.id}/set-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAcademicYears();
      } else {
        toast.error(data.message || 'Failed to set active year');
      }
    } catch (error) {
      console.error('Failed to set active year:', error);
      toast.error('Failed to set active year');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAcademicYear = async (year: AcademicYear) => {
    if (year.isActive) {
      toast.error('Cannot delete the active academic year. Please set another year as active first.');
      return;
    }
    
    if (!confirm(`Delete academic year ${year.year}? This action cannot be undone.`)) return;
    
    setActionLoading(year.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/teacher-assignments/academic-years/${year.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAcademicYears();
      } else {
        toast.error(data.message || 'Failed to delete academic year');
      }
    } catch (error) {
      console.error('Failed to delete academic year:', error);
      toast.error('Failed to delete academic year');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (year: AcademicYear) => {
    setSelectedYear(year);
    setFormData({
      year: year.year,
      startDate: year.startDate.split('T')[0],
      endDate: year.endDate.split('T')[0],
      isActive: year.isActive
    });
    setShowEditModal(true);
  };

  const filterYears = () => {
    let filtered = [...academicYears];
    
    if (searchTerm) {
      filtered = filtered.filter(year =>
        year.year.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredYears(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredYears.length / itemsPerPage);
  const paginatedYears = filteredYears.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeYear = academicYears.find(y => y.isActive);
  const totalYears = academicYears.length;

  const stats = [
    { title: 'Total Years', value: totalYears, icon: <CalendarDays size={20} />, color: 'bg-blue-500' },
    { title: 'Active Year', value: activeYear?.year || 'None', icon: <Star size={20} />, color: 'bg-green-500' },
    { title: 'Upcoming Years', value: academicYears.filter(y => new Date(y.startDate) > new Date()).length, icon: <TrendingUp size={20} />, color: 'bg-purple-500' },
    { title: 'Past Years', value: academicYears.filter(y => new Date(y.endDate) < new Date()).length, icon: <Calendar size={20} />, color: 'bg-orange-500' },
  ];

  const AcademicYearRow = ({ year }: { year: AcademicYear }) => {
    const isActive = year.isActive;
    const startDate = new Date(year.startDate).toLocaleDateString();
    const endDate = new Date(year.endDate).toLocaleDateString();
    const isCurrentYear = new Date(year.startDate) <= new Date() && new Date(year.endDate) >= new Date();

    return (
      <tr className={`border-t border-gray-100 hover:bg-gray-50 transition ${isActive ? 'bg-green-50' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isActive ? 'bg-green-500' : 'bg-blue-500'}`}>
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{year.year}</p>
              {isCurrentYear && !isActive && (
                <p className="text-xs text-green-600">Current Year</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{startDate}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{endDate}</td>
        <td className="px-4 py-3">
          {isActive ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1 w-fit">
              <CheckCircle size={10} />
              Active
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 flex items-center gap-1 w-fit">
              <XCircle size={10} />
              Inactive
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {!isActive && (
              <button
                onClick={() => handleSetActiveYear(year)}
                disabled={actionLoading === year.id}
                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition"
                title="Set as Active"
              >
                {actionLoading === year.id ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
              </button>
            )}
            <button
              onClick={() => handleEditClick(year)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition"
              title="Edit Year"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleDeleteAcademicYear(year)}
              disabled={actionLoading === year.id || isActive}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
              title="Delete Year"
            >
              {actionLoading === year.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const AddAcademicYearModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarDays size={20} />
              <h2 className="text-lg font-bold">Add Academic Year</h2>
            </div>
            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleAddAcademicYear} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="e.g., 2024-2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">Format: YYYY-YYYY (e.g., 2024-2025)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Set as Active Academic Year
            </label>
          </div>

          {formData.isActive && (
            <div className="bg-yellow-50 rounded-lg p-2 text-sm text-yellow-700">
              ⚠️ Setting this as active will deactivate any other active year.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {formLoading ? 'Creating...' : 'Create Year'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditAcademicYearModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Edit size={20} />
              <h2 className="text-lg font-bold">Edit Academic Year</h2>
            </div>
            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateAcademicYear} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="editIsActive" className="text-sm text-gray-700">
              Set as Active Academic Year
            </label>
          </div>

          {formData.isActive && !selectedYear?.isActive && (
            <div className="bg-yellow-50 rounded-lg p-2 text-sm text-yellow-700">
              ⚠️ Setting this as active will deactivate any other active year.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Academic Year Management</h1>
              </div>
              <p className="text-gray-500 text-sm">Manage academic years and set active year for the system</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus size={18} />
              Add Academic Year
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
              placeholder="Search academic years..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Academic Years Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : filteredYears.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <CalendarDays size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No academic years found</p>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add your first academic year
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedYears.map((year) => (
                      <AcademicYearRow key={year.id} year={year} />
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
      {showAddModal && <AddAcademicYearModal />}
      {showEditModal && <EditAcademicYearModal />}
    </div>
  );
};

export default AdminAcademicYears;