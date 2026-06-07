// backend/src/config/socket.ts

import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import ChatService from '../services/chatService.js';

const prisma = new PrismaClient();
let io: SocketServer | null = null;
let isInitialized = false;

export const initializeSocket = (server: HttpServer) => {
  try {
    io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    // Auth middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        socket.data.userId = decoded.id;
        socket.data.role = decoded.role;
        next();
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    });

    io.on('connection', async (socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;

      console.log(`✅ User ${userId} (${role}) connected`);

      // Join rooms
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);

      if (role === 'STUDENT') {
        try {
          const student = await prisma.student.findUnique({
            where: { userId },
            select: { classId: true }
          });
          if (student?.classId) {
            socket.join(`class:${student.classId}`);
            console.log(`📚 Student joined class:${student.classId}`);
          }
        } catch (error) {
          console.error('Error fetching student class:', error);
        }
      }

      // Send initial unread notification count
      try {
        const unreadCount = await prisma.notification.count({
          where: { userId, isRead: false }
        });
        socket.emit('unread-count', unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }

      // ==================== CHAT EVENTS ====================
      
      // Handle typing indicator
      socket.on('typing', async ({ receiverId, isTyping }) => {
        socket.to(`user:${receiverId}`).emit('user-typing', {
          userId,
          isTyping
        });
      });
      
      // Handle stop typing
      socket.on('stop-typing', async ({ receiverId }) => {
        socket.to(`user:${receiverId}`).emit('user-stop-typing', {
          userId
        });
      });
      
      // Handle message read receipt
      socket.on('mark-read', async ({ messageId, senderId }) => {
        try {
          await ChatService.markAsRead(messageId, userId);
          socket.to(`user:${senderId}`).emit('message-read', { 
            messageId, 
            userId,
            readAt: new Date()
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });
      
      // Handle mark all messages as read for a conversation
      socket.on('mark-conversation-read', async ({ conversationId, senderId }) => {
        try {
          await prisma.message.updateMany({
            where: {
              conversationId,
              receiverId: userId,
              isRead: false
            },
            data: { isRead: true, readAt: new Date() }
          });
          socket.to(`user:${senderId}`).emit('conversation-read', { 
            conversationId, 
            userId 
          });
        } catch (error) {
          console.error('Error marking conversation as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ User ${userId} disconnected`);
      });
    });

    isInitialized = true;
    console.log('✅ Socket.io initialized successfully with chat support');
    return io;
  } catch (error) {
    console.error('❌ Socket.io initialization failed:', error);
    isInitialized = false;
    return null;
  }
};

export const getIO = () => {
  if (!isInitialized || !io) {
    return null;
  }
  return io;
};

export const sendNotificationToUser = (userId: number, notification: any) => {
  const socket = getIO();
  if (socket) {
    socket.to(`user:${userId}`).emit('new-notification', notification);
  }
};

export const sendNotificationToClass = (classId: number, notification: any) => {
  const socket = getIO();
  if (socket) {
    socket.to(`class:${classId}`).emit('new-notification', notification);
  }
};

export const sendNotificationToRole = (role: string, notification: any) => {
  const socket = getIO();
  if (socket) {
    socket.to(`role:${role}`).emit('new-notification', notification);
  }
};

export const updateUnreadCount = async (userId: number) => {
  const socket = getIO();
  if (!socket) return;
  
  const newPrisma = new PrismaClient();
  try {
    const count = await newPrisma.notification.count({
      where: { userId, isRead: false }
    });
    socket.to(`user:${userId}`).emit('unread-count', count);
  } catch (error) {
    console.error('Error updating unread count:', error);
  } finally {
    await newPrisma.$disconnect();
  }
};

// Chat-specific helper functions
export const emitNewMessage = (receiverId: number, message: any) => {
  const socket = getIO();
  if (socket) {
    socket.to(`user:${receiverId}`).emit('new-message', message);
  }
};

export const emitMessageSent = (senderId: number, message: any) =>{
  const socket = getIO();
  if (socket) {
    socket.to(`user:${senderId}`).emit('message-sent', message);
  }
};

export const emitUserTyping = (receiverId: number, userId: number, isTyping: boolean) => {
  const socket = getIO();
  if (socket) {
    socket.to(`user:${receiverId}`).emit('user-typing', { userId, isTyping });
  }
};