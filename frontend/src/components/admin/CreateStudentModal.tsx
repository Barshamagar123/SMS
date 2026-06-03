// src/components/admin/CreateStudentModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Loader2, Copy, Check, Eye, EyeOff, User, Users, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/api';
import toast from 'react-hot-toast';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PasswordModalData {
  email: string;
  password: string;
  name: string;
  rollNumber?: string;
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordModalData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    classId: '',
    dateOfBirth: '',
    gender: 'MALE',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    address: '',
    city: '',
    state: '',
    bloodGroup: '',
    phone: '',
    parentEmail: '',
    nationality: 'Indian',
    religion: '',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    previousClass: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      setError(null);
      setShowPasswordModal(false);
      setPasswordData(null);
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter student name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter email');
      return false;
    }
    if (!formData.classId) {
      toast.error('Please select a class');
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error('Please select date of birth');
      return false;
    }
    if (!formData.fatherName.trim()) {
      toast.error('Please enter father name');
      return false;
    }
    if (!formData.motherName.trim()) {
      toast.error('Please enter mother name');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      toast.error('Please enter parent phone');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        classId: parseInt(formData.classId),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        parentPhone: formData.parentPhone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        bloodGroup: formData.bloodGroup || null,
        phone: formData.phone?.trim() || null,
        parentEmail: formData.parentEmail?.trim() || null,
        nationality: formData.nationality,
        religion: formData.religion?.trim() || null,
        admissionDate: formData.admissionDate,
        previousSchool: formData.previousSchool?.trim() || null,
        previousClass: formData.previousClass?.trim() || null
      };

      console.log('Sending data:', submitData);

      // Use authApi.createStudent
      const response = await authApi.createStudent(submitData);
      console.log('Response:', response.data);

      if (response.data.success) {
        // Store password data
        setPasswordData({
          email: formData.email,
          password: response.data.data.defaultPassword,
          name: formData.name,
          rollNumber: response.data.data.rollNumber
        });
        
        // Show password modal
        setShowPasswordModal(true);
        
        // Reset form
        setFormData({
          email: '',
          name: '',
          classId: '',
          dateOfBirth: '',
          gender: 'MALE',
          fatherName: '',
          motherName: '',
          parentPhone: '',
          address: '',
          city: '',
          state: '',
          bloodGroup: '',
          phone: '',
          parentEmail: '',
          nationality: 'Indian',
          religion: '',
          admissionDate: new Date().toISOString().split('T')[0],
          previousSchool: '',
          previousClass: ''
        });
        
        // Refresh student list
        onSuccess();
        toast.success('Student created successfully!');
      } else {
        setError(response.data.message || 'Failed to create student');
        toast.error(response.data.message || 'Failed to create student');
      }
    } catch (error: any) {
      console.error('Error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create student';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMainModal = () => {
    setFormData({
      email: '',
      name: '',
      classId: '',
      dateOfBirth: '',
      gender: 'MALE',
      fatherName: '',
      motherName: '',
      parentPhone: '',
      address: '',
      city: '',
      state: '',
      bloodGroup: '',
      phone: '',
      parentEmail: '',
      nationality: 'Indian',
      religion: '',
      admissionDate: new Date().toISOString().split('T')[0],
      previousSchool: '',
      previousClass: ''
    });
    setError(null);
    onClose();
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
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Create New Student</h2>
                  <p className="text-blue-100 text-sm mt-1">Fill in the student details below</p>
                </div>
                <button 
                  onClick={handleCloseMainModal} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.displayName || `${cls.name} ${cls.section}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-600" />
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone *</label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-600" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-green-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Class</label>
                    <input
                      type="text"
                      name="previousClass"
                      value={formData.previousClass}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t p-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseMainModal}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition font-medium"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create Student'}
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
                  <h3 className="text-xl font-bold">Student Created!</h3>
                  <p className="text-green-100 text-sm">Account created successfully</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Student Name</p>
                <p className="text-lg font-semibold text-gray-800">{passwordData.name}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                <p className="text-md font-medium text-gray-800">{passwordData.rollNumber || 'Generated'}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
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
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(passwordData.password)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Share these credentials with the student.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border-t p-5 flex justify-end rounded-b-2xl">
              <button
                onClick={handleClosePasswordModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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

export default CreateStudentModal;