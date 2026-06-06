// src/hooks/student/useStudentProfile.ts

import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import type { StudentProfile } from '../types/student';

export const useStudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/me/profile');
      
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<StudentProfile>) => {
    try {
      const response = await api.put('/auth/me/profile', data);
      if (response.data.success) {
        setProfile(response.data.data);
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const uploadPhoto = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const response = await api.post('/auth/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        await fetchProfile();
        return { success: true, data: response.data.data };
      }
      return { success: false, error: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message };
    }
  }, [fetchProfile]);

  const deletePhoto = useCallback(async () => {
    try {
      const response = await api.delete('/auth/me/photo');
      if (response.data.success) {
        await fetchProfile();
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message };
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    uploadPhoto, 
    deletePhoto, 
    refetch: fetchProfile 
  };
};