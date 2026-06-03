import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, RefreshCw,
  Calendar, Clock, Users, Loader2,
  ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, FileText,
  CalendarDays, Gift, Sparkles, TrendingUp, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// Separate component for Add Holiday Modal to prevent re-renders
const AddHolidayModalComponent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !date) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/holidays', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          date: date,
          description: description?.trim() || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Holiday added successfully');
        setName('');
        setDate('');
        setDescription('');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to add holiday');
      }
    } catch (error) {
      console.error('Failed to add holiday:', error);
      toast.error('Failed to add holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDate('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <h2 className="text-lg font-bold">Add Holiday</h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Diwali, Christmas, Republic Day"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {loading ? 'Adding...' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Separate component for Edit Holiday Modal to prevent re-renders
const EditHolidayModalComponent: React.FC<{
  isOpen: boolean;
  holiday: Holiday | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, holiday, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (holiday) {
      setName(holiday.name);
      setDate(holiday.date.split('T')[0]);
      setDescription(holiday.description || '');
    }
  }, [holiday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!holiday) return;
    if (!name.trim() || !date) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/holidays/${holiday.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          date: date,
          description: description?.trim() || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Holiday updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update holiday');
      }
    } catch (error) {
      console.error('Failed to update holiday:', error);
      toast.error('Failed to update holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDate('');
    setDescription('');
    onClose();
  };

  if (!isOpen || !holiday) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Edit size={20} />
              <h2 className="text-lg font-bold">Edit Holiday</h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminHolidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHolidays();
  }, [filterYear, filterMonth]);

  useEffect(() => {
    filterHolidays();
  }, [searchTerm, holidays]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let url = 'http://localhost:3000/api/holidays';
      
      const params = new URLSearchParams();
      if (filterYear) params.append('year', filterYear);
      if (filterMonth) params.append('month', filterMonth);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setHolidays(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch holidays');
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (holiday: Holiday) => {
    if (!confirm(`Delete "${holiday.name}"? This action cannot be undone.`)) return;
    
    setDeletingId(holiday.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/holidays/${holiday.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to delete holiday');
      }
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      toast.error('Failed to delete holiday');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setShowEditModal(true);
  };

  const filterHolidays = () => {
    let filtered = [...holidays];
    
    if (searchTerm) {
      filtered = filtered.filter(holiday =>
        holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (holiday.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredHolidays(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterYear('');
    setFilterMonth('');
  };

  const groupedHolidays = filteredHolidays.reduce((groups, holiday) => {
    const date = new Date(holiday.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!groups[key]) {
      groups[key] = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthName: date.toLocaleString('default', { month: 'long' }),
        holidays: []
      };
    }
    groups[key].holidays.push(holiday);
    return groups;
  }, {} as Record<string, { year: number; month: number; monthName: string; holidays: Holiday[] }>);

  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const paginatedHolidays = filteredHolidays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const stats = [
    { title: 'Total Holidays', value: holidays.length, icon: <Gift size={20} />, color: 'bg-blue-500' },
    { title: 'This Year', value: holidays.filter(h => new Date(h.date).getFullYear() === new Date().getFullYear()).length, icon: <Calendar size={20} />, color: 'bg-green-500' },
    { title: 'Upcoming', value: holidays.filter(h => new Date(h.date) > new Date()).length, icon: <CalendarDays size={20} />, color: 'bg-purple-500' },
    { title: 'Past Holidays', value: holidays.filter(h => new Date(h.date) < new Date()).length, icon: <Clock size={20} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Holiday Management</h1>
              </div>
              <p className="text-gray-500 text-sm">Manage school holidays and academic calendar</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus size={18} />
              Add Holiday
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search holidays by name..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Months</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || filterYear || filterMonth) && (
            <div className="mt-3 flex justify-end">
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <X size={14} /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Holidays List */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={40} className="animate-spin text-blue-500" />
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No holidays found</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-blue-600 hover:text-blue-700">
              Add your first holiday
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(groupedHolidays).map((group) => (
              <div key={`${group.year}-${group.month}`} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">
                      {group.monthName} {group.year}
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {group.holidays.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {group.holidays.map((holiday) => (
                    <div key={holiday.id} className="p-3 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Gift className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{holiday.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">
                                {new Date(holiday.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              {holiday.description && (
                                <span className="text-xs text-gray-400">• {holiday.description}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(holiday)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday)}
                            disabled={deletingId === holiday.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === holiday.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals - Using separate components to prevent re-renders */}
      <AddHolidayModalComponent 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchHolidays}
      />
      
      <EditHolidayModalComponent 
        isOpen={showEditModal}
        holiday={selectedHoliday}
        onClose={() => {
          setShowEditModal(false);
          setSelectedHoliday(null);
        }}
        onSuccess={fetchHolidays}
      />
    </div>
  );
};

export default AdminHolidays;