// src/pages/teacher/CreateAssignment.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { assignmentApi, classApi } from '../../api/api';
import toast from 'react-hot-toast';

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

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    totalMarks: 100,
    passingMarks: 40
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const response = await classApi.getAll();
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await classApi.getSubjects(Number(selectedClassId));
      if (response.data.success) {
        setSubjects(response.data.data.subjects);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 20MB)`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter assignment title');
      return;
    }
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }
    if (!formData.subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Please select due date');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        classId: selectedClassId,
        subjectId: formData.subjectId,
        dueDate: formData.dueDate,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks
      };

      const response = await assignmentApi.createAssignment(submitData, files);
      if (response.data.success) {
        toast.success('Assignment created successfully!');
        navigate('/teacher/assignments');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Assignment</h1>
        <p className="text-gray-500 mt-1">Post a new assignment for students</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Mathematics Assignment - Chapter 3"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the assignment requirements..."
          />
        </div>

        {/* Class and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedClassId}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date and Marks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
            <input
              type="number"
              name="passingMarks"
              value={formData.passingMarks}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <Upload size={18} />
              Choose Files
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, DOC, DOCX, JPG, PNG, TXT (Max 20MB per file)
            </p>
          </div>
          
          {files.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-gray-700">Selected Files:</p>
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/teacher/assignments')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;