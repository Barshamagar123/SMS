// src/components/student/ProfileForm.tsx

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { StudentProfile } from '../../types/student';

interface ProfileFormProps {
  profile: StudentProfile | null;
  onUpdate: (data: Partial<StudentProfile>) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onUpdate, loading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await onUpdate(formData);
    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <button 
            onClick={() => { setIsEditing(false); }} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              <input 
                type="text" 
                value={profile?.name || ''} 
                disabled 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-gray-400" />
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-gray-400" />
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                disabled={!isEditing} 
                rows={2}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleInputChange} 
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-800 mb-3">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input 
                  type="text" 
                  value={profile?.fatherName || ''} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input 
                  type="text" 
                  value={profile?.motherName || ''} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                <input 
                  type="text" 
                  value={profile?.parentPhone || ''} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                <input 
                  type="email" 
                  value={profile?.parentEmail || ''} 
                  disabled 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50" 
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;