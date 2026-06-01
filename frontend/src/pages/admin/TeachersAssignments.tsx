import React, { useEffect, useState } from 'react';
import { 
  Search, Trash2, RefreshCw, Plus,
  School, Users, BookOpen, ChevronLeft, ChevronRight,
  Loader2, Calendar, Link2, User,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateAssignmentModal from '../../components/admin/CreateAssignmentModal';

interface Assignment {
  id: number;
  teacher: {
    id: number;
    name: string;
    employeeId: string;
  };
  class: {
    id: number;
    name: string;
    section: string;
    displayName: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
  };
  academicYear: string;
  isPrimary: boolean;
  assignedAt: string;
}

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

const AdminTeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Fetch assignments when academic year filter changes
  useEffect(() => {
    fetchAssignments();
  }, [selectedAcademicYear]);

  const fetchAcademicYears = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/academic-years', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Academic years response:', data);
      
      if (data.success) {
        setAcademicYears(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let url = 'http://localhost:3000/api/teacher-assignments';
      
      // Only add filter if not "all"
      if (selectedAcademicYear !== 'all') {
        url = `http://localhost:3000/api/teacher-assignments/academic-year/${selectedAcademicYear}`;
      }
      
      console.log('Fetching assignments from:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Assignments response:', data);
      
      if (data.success) {
        // Directly set the data array
        const assignmentsData = Array.isArray(data.data) ? data.data : [];
        setAssignments(assignmentsData);
      } else {
        toast.error(data.message || 'Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`Remove ${assignment.teacher.name} from ${assignment.class.displayName} - ${assignment.subject.name}?`)) return;
    
    setDeletingId(assignment.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/teacher-assignments/${assignment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Assignment removed successfully');
        fetchAssignments();
      } else {
        toast.error(data.message || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error('Failed to remove assignment');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter assignments by search term
  const filteredAssignments = assignments.filter(assignment => {
    if (searchTerm === '') return true;
    const search = searchTerm.toLowerCase();
    return (
      assignment.teacher.name.toLowerCase().includes(search) ||
      assignment.teacher.employeeId.toLowerCase().includes(search) ||
      assignment.class.displayName.toLowerCase().includes(search) ||
      assignment.subject.name.toLowerCase().includes(search) ||
      assignment.subject.code.toLowerCase().includes(search)
    );
  });

  const stats = [
    { title: 'Total Assignments', value: assignments.length, icon: <Link2 size={20} />, color: 'bg-purple-500' },
    { title: 'Teachers Assigned', value: [...new Set(assignments.map(a => a.teacher.id))].length, icon: <Users size={20} />, color: 'bg-blue-500' },
    { title: 'Classes Covered', value: [...new Set(assignments.map(a => a.class.id))].length, icon: <School size={20} />, color: 'bg-green-500' },
    { title: 'Subjects Taught', value: [...new Set(assignments.map(a => a.subject.id))].length, icon: <BookOpen size={20} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Assignments</h1>
            <p className="text-gray-500 text-sm mt-1">Assign teachers to subjects and classes</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={18} />
              New Assignment
            </button>
            <button 
              onClick={fetchAssignments} 
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="all">All Years</option>
                {academicYears.map(year => (
                  <option key={year.id} value={year.id.toString()}>
                    {year.year} {year.isActive && '(Active)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by teacher, class, or subject..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-purple-500" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <Link2 size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No teacher assignments found</p>
            {assignments.length === 0 && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create your first assignment
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{assignment.teacher.name}</p>
                            <p className="text-xs text-gray-500">{assignment.teacher.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <School size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{assignment.class.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{assignment.subject.name}</span>
                          <span className="text-xs text-gray-400">({assignment.subject.code})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{assignment.academicYear}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {assignment.isPrimary ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                            <CheckCircle size={10} />
                            Primary
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            Secondary
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleDeleteAssignment(assignment)} 
                          disabled={deletingId === assignment.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" 
                          title="Remove Assignment"
                        >
                          {deletingId === assignment.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchAssignments}
          academicYears={academicYears}
        />
      )}
    </div>
  );
};

export default AdminTeacherAssignments;