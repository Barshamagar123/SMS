// backend/src/routes/notificationRoutes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notificationController.js';
const router = Router();
// GET routes
router.get('/', authenticate, getMyNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
// PUT routes
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
// DELETE routes
router.delete('/:id', authenticate, deleteNotification);
router.delete('/', authenticate, deleteAllNotifications);
export default router;
//# sourceMappingURL=notificationRoutes.js.map