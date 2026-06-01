import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamType {
  id: number;
  name: string;
  weightage: number;
}

interface Class {
  id: number;
  displayName: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examTypes: ExamType[];
  classes: Class[];
  subjects: Subject[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ 
  isOpen, onClose, onSuccess, examTypes, classes, subjects 
}) => {
  const [formData, setFormData] = useState({
    examTypeId: '',
    classId: '',
    subjectId: '',
    name: '',
    examDate: '',
    maxMarks: '',
    passingMarks: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActiveAcademicYear();
    }
  }, [isOpen]);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsForClass(parseInt(formData.classId));
    } else {
      setFilteredSubjects([]);
      setFormData(prev => ({ ...prev, subjectId: '' }));
    }
  }, [formData.classId]);

  const fetchActiveAcademicYear = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/academic-years/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAcademicYearId(data.data.id.toString());
      } else {
        const allYearsRes = await fetch('http://localhost:3000/api/teacher-assignments/academic-years', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allYearsData = await allYearsRes.json();
        if (allYearsData.success && allYearsData.data && allYearsData.data.length > 0) {
          setAcademicYearId(allYearsData.data[0].id.toString());
          toast.error('No active academic year found. Using the first available year.');
        } else {
          toast.error('No academic year found. Please create an academic year first.');
        }
      }
    } catch (error) {
      console.error('Failed to fetch academic year:', error);
      toast.error('Failed to fetch academic year');
    }
  };

  const fetchSubjectsForClass = async (classId: number) => {
    setLoadingSubjects(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/classes/${classId}/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Subjects for class:', data);
      
      if (data.success) {
        // Handle different response structures
        let subjectsList = [];
        if (data.data && data.data.subjects) {
          subjectsList = data.data.subjects;
        } else if (data.data && Array.isArray(data.data)) {
          subjectsList = data.data;
        } else if (Array.isArray(data.data)) {
          subjectsList = data.data;
        } else {
          subjectsList = [];
        }
        setFilteredSubjects(subjectsList);
        
        if (subjectsList.length === 0) {
          toast.error('No subjects assigned to this class. Please assign subjects first.');
        }
      } else {
        setFilteredSubjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch class subjects:', error);
      setFilteredSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.examTypeId || !formData.classId || !formData.subjectId || !formData.name || !formData.examDate || !formData.maxMarks || !formData.passingMarks) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!academicYearId) {
      toast.error('No academic year available');
      return;
    }

    const maxMarksNum = parseInt(formData.maxMarks);
    const passingMarksNum = parseInt(formData.passingMarks);
    
    if (passingMarksNum > maxMarksNum) {
      toast.error('Passing marks cannot exceed max marks');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('http://localhost:3000/api/exams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examTypeId: parseInt(formData.examTypeId),
          classId: parseInt(formData.classId),
          subjectId: parseInt(formData.subjectId),
          academicYearId: parseInt(academicYearId),
          name: formData.name,
          examDate: formData.examDate,
          maxMarks: maxMarksNum,
          passingMarks: passingMarksNum,
          description: formData.description || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Exam created successfully');
        setFormData({
          examTypeId: '',
          classId: '',
          subjectId: '',
          name: '',
          examDate: '',
          maxMarks: '',
          passingMarks: '',
          description: ''
        });
        setFilteredSubjects([]);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Failed to create exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Exam</h2>
                <p className="text-blue-100 text-sm">Schedule an exam for a class and subject</p>
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
                Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.examTypeId}
                onChange={(e) => setFormData({ ...formData, examTypeId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Exam Type</option>
                {examTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: '' })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                disabled={!formData.classId || loadingSubjects}
              >
                <option value="">
                  {!formData.classId 
                    ? 'Select Class First' 
                    : loadingSubjects 
                      ? 'Loading subjects...' 
                      : filteredSubjects.length === 0 
                        ? 'No subjects assigned to this class' 
                        : 'Select Subject'}
                </option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
              {formData.classId && filteredSubjects.length === 0 && !loadingSubjects && (
                <p className="text-xs text-red-500 mt-1">
                  No subjects assigned to this class. Please go to Classes page and assign subjects first.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics Monthly Test"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                placeholder="e.g., 100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                placeholder="e.g., 35"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional information about the exam..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;