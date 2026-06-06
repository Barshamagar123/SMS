// src/pages/student/MyProfile.tsx

import React from 'react';
import { Loader2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudentProfile } from '../../hooks/useStudentProfile';  // ← FIXED: Added /student/
import ProfileForm from '../../components/student/ProfileForm';

const MyProfile: React.FC = () => {
  const { profile, loading, updateProfile, uploadPhoto, deletePhoto } = useStudentProfile();

  console.log('Profile data:', profile);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and GIF images are allowed');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo size must be less than 2MB');
      return;
    }
    
    const result = await uploadPhoto(file);
    if (result.success) {
      toast.success('Photo updated successfully');
    } else {
      toast.error(result.error || 'Failed to update photo');
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return;
    const result = await deletePhoto();
    if (result.success) {
      toast.success('Photo deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">View and manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto overflow-hidden">
                {profile?.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `http://localhost:3000${profile.profilePhoto}`} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', profile.profilePhoto);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">{profile?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <Camera size={16} className="text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg,image/jpg,image/png,image/gif" 
                  onChange={handlePhotoUpload} 
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">{profile?.name}</h2>
            <p className="text-gray-500">{profile?.rollNumber}</p>
            <p className="text-sm text-blue-600 mt-1">{profile?.className}</p>
            {profile?.profilePhoto && (
              <button
                onClick={handleDeletePhoto}
                className="mt-3 text-sm text-red-600 hover:text-red-700 transition"
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <ProfileForm profile={profile} onUpdate={updateProfile} />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;