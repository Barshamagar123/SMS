import React, { useState } from 'react';
import { X, Loader2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/api';
import toast from 'react-hot-toast';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PasswordModalData {
  email: string;
  password: string;
  name: string;
}

const CreateTeacherModal: React.FC<CreateTeacherModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordModalData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    qualification: '',
    specialization: '',
    phone: '',
    address: '',
    hireDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.name || !formData.email || !formData.qualification || 
        !formData.specialization || !formData.phone || !formData.address || !formData.hireDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    toast.loading('Creating teacher...', { id: 'create-teacher' });

    try {
      const response = await authApi.createTeacher(formData);

      toast.dismiss('create-teacher');

      if (response.data.success) {
        toast.success('Teacher created successfully!', { icon: '🎉' });

        setPasswordData({
          email: formData.email,
          password: response.data.data.defaultPassword,
          name: formData.name
        });
        setShowPasswordModal(true);

        setFormData({
          email: '',
          name: '',
          qualification: '',
          specialization: '',
          phone: '',
          address: '',
          hireDate: new Date().toISOString().split('T')[0]
        });

        onSuccess();
      }
    } catch (error: any) {
      toast.dismiss('create-teacher');
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData(null);
    setCopied(false);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen && !showPasswordModal) return null;

  return (
    <>
      {/* Main Modal */}
      {isOpen && !showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Create New Teacher</h2>
                  <p className="text-purple-100 text-sm mt-1">Fill in the teacher details below</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter teacher's full name"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="teacher@school.com"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    placeholder="e.g., M.Ed, B.Ed, PhD"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mathematics, Science, English"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="Complete address"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-5 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Teacher Created!</h3>
                  <p className="text-green-100 text-sm">Account created successfully</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Teacher Name</p>
                <p className="text-lg font-semibold text-gray-800">{passwordData.name}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="text-md font-medium text-gray-800 break-all">{passwordData.email}</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                <p className="text-sm text-gray-600 mb-2">🔑 Temporary Password</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-lg font-mono font-bold text-gray-800 bg-white px-3 py-2 rounded-lg flex-1 text-center">
                    {showPassword ? passwordData.password : '••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(passwordData.password)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                    type="button"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Please share these credentials with the teacher. They can change password after first login.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border-t p-5 flex justify-end rounded-b-2xl">
              <button
                onClick={handleClosePasswordModal}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTeacherModal;