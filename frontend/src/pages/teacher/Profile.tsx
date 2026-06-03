// src/pages/teacher/Profile.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, 
  GraduationCap, Lock, Eye, EyeOff, Save, Camera, 
  X, Loader2, Upload, CheckCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeacherProfile {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  address: string;
  hireDate: string;
  profilePhoto: string | null;
}

const TeacherProfile: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch profile
      const response = await fetch('http://localhost:3000/api/auth/teachers/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setFormData({ 
          phone: data.data.phone || '', 
          address: data.data.address || '' 
        });
        
        // Load profile photo if exists
        if (data.data.profilePhoto) {
          try {
            const photoResponse = await fetch(`http://localhost:3000/api/auth/teachers/me/photo`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (photoResponse.ok) {
              const photoBlob = await photoResponse.blob();
              const photoUrl = URL.createObjectURL(photoBlob);
              setPhotoPreview(photoUrl);
            }
          } catch (err) {
            console.error('Failed to load photo:', err);
          }
        }
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('http://localhost:3000/api/auth/teachers/me/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile photo uploaded successfully!');
        // Refresh profile to get updated photo URL
        fetchProfile();
      } else {
        toast.error(data.message || 'Failed to upload photo');
        // Reset preview on error
        if (profile?.profilePhoto) {
          const token = localStorage.getItem('accessToken');
          const photoResponse = await fetch(`http://localhost:3000/api/auth/teachers/me/photo`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            const url = URL.createObjectURL(blob);
            setPhotoPreview(url);
          } else {
            setPhotoPreview(null);
          }
        } else {
          setPhotoPreview(null);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      // Reset preview on error
      if (profile?.profilePhoto) {
        const token = localStorage.getItem('accessToken');
        const photoResponse = await fetch(`http://localhost:3000/api/auth/teachers/me/photo`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          const url = URL.createObjectURL(blob);
          setPhotoPreview(url);
        }
      } else {
        setPhotoPreview(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/auth/teachers/me/photo', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile photo deleted successfully');
        setPhotoPreview(null);
        fetchProfile();
      } else {
        toast.error(data.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/auth/me/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: formData.phone,
          address: formData.address
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchProfile();
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
        <p className="text-gray-500">Failed to load profile</p>
        <button 
          onClick={fetchProfile} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-blue-100 text-sm mt-1">Manage your personal information and profile photo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto overflow-hidden ring-4 ring-blue-100">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-all duration-200 shadow-lg hover:scale-110 disabled:opacity-50"
                title="Upload Photo"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            {uploading && (
              <p className="text-xs text-blue-500 mt-2">Uploading...</p>
            )}
            {photoPreview && (
              <button
                onClick={handleDeletePhoto}
                className="mt-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Remove Photo
              </button>
            )}
            <h2 className="text-xl font-bold mt-4">{profile.name}</h2>
            <p className="text-gray-500">{profile.employeeId}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              <CheckCircle size={12} />
              Active
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Qualification</p>
                <p className="text-sm font-medium">{profile.qualification || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Specialization</p>
                <p className="text-sm font-medium">{profile.specialization || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Personal Information
              </h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{profile.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Hire Date</p>
                  <p className="text-sm text-gray-800">{new Date(profile.hireDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Address</p>
                  {editing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-sm text-gray-800">{profile.address || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl shadow-lg border p-6">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Lock size={18} />
              Change Password
            </button>

            {showChangePassword && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;