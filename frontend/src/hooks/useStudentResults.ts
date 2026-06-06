// src/hooks/student/useStudentResults.ts

import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import type { ExamResult } from '../types/student';

export const useStudentResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/exams/my-results');
      
      if (response.data.success) {
        const data = response.data.data;
        setResults(Array.isArray(data) ? data : data.results || []);
      } else {
        setError(response.data.message || 'Failed to load results');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return { results, loading, error, refetch: fetchResults };
};