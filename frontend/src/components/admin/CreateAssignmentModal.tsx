import React, { useEffect, useState } from 'react';
import { X, Loader2, Link2, School, BookOpen, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Teacher {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  isActive: boolean;
}

interface Class {
  id: number;
  name: string;
  section: string;
  displayName: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYears: AcademicYear[];
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ 
  isOpen, onClose, onSuccess, academicYears 
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    classId: '',
    subjectId: '',
    academicYearId: '',
    isPrimary: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      fetchClasses();
      // Set default academic year to active one
      const activeYear = academicYears.find(y => y.isActive);
      if (activeYear && !formData.academicYearId) {
        setFormData(prev => ({ ...prev, academicYearId: activeYear.id.toString() }));
      }
    }
  }, [isOpen, academicYears]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsForClass(parseInt(formData.classId));
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.classId]);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/auth/teachers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data.filter((t: Teacher) => t.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to fetch classes');
    }
  };

  const fetchSubjectsForClass = async (classId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/classes/${classId}/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        let subjectsList = [];
        if (data.data && data.data.subjects) {
          subjectsList = data.data.subjects;
        } else if (data.data && Array.isArray(data.data)) {
          subjectsList = data.data;
        } else {
          subjectsList = [];
        }
        setFilteredSubjects(subjectsList);
      }
    } catch (error) {
      console.error('Failed to fetch class subjects:', error);
      setFilteredSubjects([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacherId || !formData.classId || !formData.subjectId || !formData.academicYearId) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacherId: parseInt(formData.teacherId),
          classId: parseInt(formData.classId),
          subjectId: parseInt(formData.subjectId),
          academicYearId: parseInt(formData.academicYearId),
          isPrimary: formData.isPrimary
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Teacher assigned successfully');
        setFormData({
          teacherId: '',
          classId: '',
          subjectId: '',
          academicYearId: '',
          isPrimary: true
        });
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to assign teacher');
      }
    } catch (error) {
      console.error('Failed to assign teacher:', error);
      toast.error('Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Link2 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Teacher</h2>
                <p className="text-purple-100 text-sm">Assign teacher to subject and class</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Teacher <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: '' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
                disabled={!formData.classId}
              >
                <option value="">{formData.classId ? 'Select Subject' : 'Select Class First'}</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.academicYearId}
                onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} {year.isActive && '(Active)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isPrimary === true}
                  onChange={() => setFormData({ ...formData, isPrimary: true })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700">Primary Teacher</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isPrimary === false}
                  onChange={() => setFormData({ ...formData, isPrimary: false })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700">Secondary Teacher</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
              {loading ? 'Assigning...' : 'Assign Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;