// backend/src/controllers/notificationController.ts
import { NotificationService } from '../services/notificationService.js';
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const { notifications, total, unreadCount } = await NotificationService.getUserNotifications(userId, page, limit);
        res.json({
            success: true,
            data: { notifications, total, unreadCount, page, limit }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const unreadCount = await NotificationService.getUnreadCount(userId);
        res.json({ success: true, data: { unreadCount } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID' });
        }
        await NotificationService.markAsRead(id, req.user.id);
        res.json({ success: true, message: 'Marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        await NotificationService.markAllAsRead(req.user.id);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getNotificationById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID' });
        }
        const notification = await NotificationService.getNotificationById(id, req.user.id);
        res.json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID' });
        }
        await NotificationService.deleteNotification(id, req.user.id);
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteAllNotifications = async (req, res) => {
    try {
        await NotificationService.deleteAllNotifications(req.user.id);
        res.json({ success: true, message: 'All notifications deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=notificationController.js.map