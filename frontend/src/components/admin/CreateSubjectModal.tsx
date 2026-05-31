import React, { useState } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Subject name and code are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Subject created successfully');
        setFormData({ name: '', code: '', description: '' });
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create subject');
      }
    } catch (error) {
      console.error('Failed to create subject:', error);
      toast.error('Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const subjectSuggestions = [
    { name: 'Mathematics', code: 'MATH101' },
    { name: 'Physics', code: 'PHY101' },
    { name: 'Chemistry', code: 'CHEM101' },
    { name: 'Biology', code: 'BIO101' },
    { name: 'English', code: 'ENG101' },
    { name: 'Computer Science', code: 'CS101' },
    { name: 'History', code: 'HIST101' },
    { name: 'Geography', code: 'GEO101' },
    { name: 'Economics', code: 'ECO101' },
    { name: 'Accountancy', code: 'ACC101' },
  ];

  const fillSuggestion = (subject: { name: string; code: string }) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Subject</h2>
                <p className="text-green-100 text-sm">Add a subject to the system</p>
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
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mathematics, Science, English"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., MATH101, SCI202, ENG301"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-mono"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Use uppercase letters and numbers only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the subject..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {subjectSuggestions.slice(0, 5).map((subject, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillSuggestion(subject)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {formData.name && formData.code && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Preview:</strong> {formData.name} ({formData.code})
              </p>
            </div>
          )}

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
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubjectModal;