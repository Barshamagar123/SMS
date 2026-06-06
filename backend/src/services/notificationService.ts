// backend/src/services/notificationService.ts

import { PrismaClient } from '@prisma/client';
import { sendNotificationToUser, sendNotificationToClass, sendNotificationToRole, updateUnreadCount } from '../config/socket.js';

const prisma = new PrismaClient();

export class NotificationService {

  // Send to single user
  static async sendToUser(userId: number, title: string, message: string, type: string, relatedId?: number) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId: relatedId || null
      }
    });
    
    // Try socket, but don't fail if not available
    try {
      sendNotificationToUser(userId, notification);
      await updateUnreadCount(userId);
    } catch (error) {
      console.log(`⚠️ WebSocket not available, notification saved to DB only for user ${userId}`);
    }
    
    return notification;
  }

  // Send to multiple users
  static async sendToMany(userIds: number[], title: string, message: string, type: string, relatedId?: number) {
    if (userIds.length === 0) return [];
    
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null
    }));
    
    await prisma.notification.createMany({ data: notifications });
    
    // Try socket, but don't fail if not available
    for (const userId of userIds) {
      try {
        const sampleNotification = { title, message, type, relatedId };
        sendNotificationToUser(userId, sampleNotification);
        await updateUnreadCount(userId);
      } catch (error) {
        console.log(`⚠️ WebSocket not available for user ${userId}`);
      }
    }
    
    return notifications;
  }

  // Send to entire class
  static async sendToClass(classId: number, title: string, message: string, type: string, relatedId?: number) {
    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      select: { userId: true }
    });
    
    const userIds = students.map(s => s.userId);
    return this.sendToMany(userIds, title, message, type, relatedId);
  }

  // Send to role (STUDENT, TEACHER, etc.)
  static async sendToRole(role: string, title: string, message: string, type: string, relatedId?: number) {
    const users = await prisma.user.findMany({
      where: { role: role as any, isActive: true },
      select: { id: true }
    });
    
    const userIds = users.map(u => u.id);
    return this.sendToMany(userIds, title, message, type, relatedId);
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);
    
    return { notifications, total, unreadCount };
  }

  // Get single notification by ID
  static async getNotificationById(notificationId: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId }
    });
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return notification;
  }

  // Mark single as read
  static async markAsRead(notificationId: number, userId: number) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });
    
    try {
      await updateUnreadCount(userId);
    } catch (error) {
      console.log(`⚠️ Could not update unread count for user ${userId}`);
    }
    
    return result;
  }

  // Mark all as read
  static async markAllAsRead(userId: number) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    
    try {
      await updateUnreadCount(userId);
    } catch (error) {
      console.log(`⚠️ Could not update unread count for user ${userId}`);
    }
    
    return result;
  }

  // Delete single notification
  static async deleteNotification(notificationId: number, userId: number) {
    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId }
    });
    
    try {
      await updateUnreadCount(userId);
    } catch (error) {
      console.log(`⚠️ Could not update unread count for user ${userId}`);
    }
    
    return result;
  }

  // Delete all notifications for user
  static async deleteAllNotifications(userId: number) {
    const result = await prisma.notification.deleteMany({
      where: { userId }
    });
    
    try {
      await updateUnreadCount(userId);
    } catch (error) {
      console.log(`⚠️ Could not update unread count for user ${userId}`);
    }
    
    return result;
  }

  // Get unread count only
  static async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }
}