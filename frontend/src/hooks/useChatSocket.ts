// src/hooks/useChatSocket.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useChatSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState<any>(null);
  const [typingUser, setTypingUser] = useState<{ userId: number; isTyping: boolean } | null>(null);
  const [messageRead, setMessageRead] = useState<{ messageId: number; userId: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Chat WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Chat WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('new-message', (message) => {
      setNewMessage(message);
    });

    newSocket.on('message-sent', (message) => {
      console.log('Message sent:', message);
    });

    newSocket.on('user-typing', (data) => {
      setTypingUser(data);
      setTimeout(() => {
        setTypingUser(null);
      }, 1500);
    });

    newSocket.on('message-read', (data) => {
      setMessageRead(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendTyping = (receiverId: number, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const markMessageRead = (messageId: number, senderId: number) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { messageId, senderId });
    }
  };

  return {
    socket,
    isConnected,
    newMessage,
    typingUser,
    messageRead,
    sendTyping,
    markMessageRead
  };
};