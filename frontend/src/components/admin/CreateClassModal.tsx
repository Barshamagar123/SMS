import React, { useState } from 'react';
import { X, Loader2, School } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);

  const gradeOptions = [
    'Nursery', 'LKG', 'UKG',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.section) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          section: formData.section
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Class created successfully');
        setFormData({ name: '', section: '' });
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <School size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Class</h2>
                <p className="text-blue-100 text-sm">Add a class with section</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="">Select Class</option>
              {gradeOptions.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="">Select Section</option>
              {sectionOptions.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> {formData.name && formData.section 
                ? `${formData.name} - Section ${formData.section}`
                : 'Select class and section'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : <School size={18} />}
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;