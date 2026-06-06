// src/hooks/student/useStudentAttendance.ts

import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import type { AttendanceData } from '../types/student';

export const useStudentAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/attendance/me');
      
      if (response.data.success) {
        setAttendance(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load attendance');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { attendance, loading, error, refetch: fetchAttendance };
};