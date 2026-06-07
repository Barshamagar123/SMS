// src/hooks/useChat.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../api/api';
import type { Message } from '../types/chat';
import { useChatSocket } from './useChatSocket';
import toast from 'react-hot-toast';

export const useChat = (conversationId: number | null, otherUserId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { newMessage, typingUser, sendTyping, markMessageRead } = useChatSocket();

  const fetchMessages = useCallback(async (reset: boolean = false) => {
    if (!conversationId) return;
    
    try {
      const currentPage = reset ? 0 : page;
      const response = await chatApi.getMessages(conversationId, 50, currentPage * 50);
      if (response.data.success) {
        const newMessages = response.data.data;
        if (reset) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
        setHasMore(newMessages.length === 50);
        if (!reset && newMessages.length > 0) {
          // Don't auto-scroll when loading older messages
        }
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, page]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      const response = await chatApi.sendMessage(otherUserId, message);
      if (response.data.success) {
        const newMsg = response.data.data;
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: number, senderId: number) => {
    try {
      await chatApi.markAsRead(messageId);
      markMessageRead(messageId, senderId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(true);
    }
  }, [conversationId]);

  useEffect(() => {
    if (newMessage && newMessage.conversationId === conversationId) {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
      if (newMessage.senderId !== otherUserId) {
        markAsRead(newMessage.id, newMessage.senderId);
      }
    }
  }, [newMessage, conversationId]);

  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.isRead && m.receiverId === otherUserId);
      unreadMessages.forEach(msg => {
        markAsRead(msg.id, msg.senderId);
      });
    }
  }, [conversationId, messages]);

  return {
    messages,
    loading,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    messagesEndRef,
    typingUser: typingUser?.userId === otherUserId ? typingUser : null,
    sendTyping: (isTyping: boolean) => sendTyping(otherUserId, isTyping)
  };
};