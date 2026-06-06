// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('new-notification', (notification) => {
      console.log('📨 New notification:', notification);
      setNewNotification(notification);
    });

    socket.on('unread-count', (count) => {
      setUnreadCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAsRead = (notificationId: number) => {
    socketRef.current?.emit('mark-notification-read', notificationId);
  };

  const markAllAsRead = () => {
    socketRef.current?.emit('mark-notification-read', 0);
  };

  return {
    isConnected,
    newNotification,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};