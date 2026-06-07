// src/hooks/useConversations.ts

import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../api/api';
import type { Conversation } from '../types/chat';
import toast from 'react-hot-toast';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await chatApi.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  return { conversations, loading, unreadCount, refetch: fetchConversations, refetchUnread: fetchUnreadCount };
};