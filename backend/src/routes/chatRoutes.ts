// backend/src/routes/chatRoutes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  getAvailableContacts,
  sendTypingIndicator,
  markConversationAsRead
} from '../controllers/chatController.js';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);
router.put('/message/:messageId/read', markAsRead);
router.delete('/message/:messageId', deleteMessage);
router.get('/unread-count', getUnreadCount);
router.get('/contacts', getAvailableContacts);
router.post('/typing', sendTypingIndicator);
router.put('/conversation/:conversationId/read', markConversationAsRead);

export default router;