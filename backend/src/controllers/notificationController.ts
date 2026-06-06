// backend/src/controllers/notificationController.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { NotificationService } from '../services/notificationService.js';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const { notifications, total, unreadCount } = await NotificationService.getUserNotifications(userId, page, limit);
    
    res.json({ 
      success: true, 
      data: { notifications, total, unreadCount, page, limit } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const unreadCount = await NotificationService.getUnreadCount(userId);
    res.json({ success: true, data: { unreadCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    
    await NotificationService.markAsRead(id, req.user!.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotificationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    
    const notification = await NotificationService.getNotificationById(id, req.user!.id);
    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }
    
    await NotificationService.deleteNotification(id, req.user!.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await NotificationService.deleteAllNotifications(req.user!.id);
    res.json({ success: true, message: 'All notifications deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};