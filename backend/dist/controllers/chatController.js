// backend/src/controllers/chatController.ts
import ChatService from '../services/chatService.js';
import { getIO } from '../config/socket.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const toNumber = (value) => {
    if (!value)
        return NaN;
    return parseInt(String(value), 10);
};
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await ChatService.getUserConversations(userId);
        res.json({ success: true, data: conversations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getMessages = async (req, res) => {
    try {
        const conversationId = toNumber(req.params.conversationId);
        if (isNaN(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }
        const limit = toNumber(req.query.limit) || 50;
        const offset = toNumber(req.query.offset) || 0;
        const userId = req.user.id;
        const messages = await ChatService.getMessages(conversationId, userId, limit, offset);
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message, attachmentUrl, attachmentType } = req.body;
        const senderId = req.user.id;
        if (!receiverId || !message) {
            return res.status(400).json({ success: false, message: 'Receiver ID and message are required' });
        }
        let conversation = await ChatService.getOrCreateConversation(senderId, toNumber(receiverId));
        const msg = await ChatService.sendMessage(conversation.id, senderId, toNumber(receiverId), message, attachmentUrl, attachmentType);
        const io = getIO();
        if (io) {
            io.to(`user:${receiverId}`).emit('new-message', msg);
            io.to(`user:${senderId}`).emit('message-sent', msg);
            const unreadCount = await ChatService.getUnreadCount(toNumber(receiverId));
            io.to(`user:${receiverId}`).emit('unread-count', unreadCount);
        }
        res.json({ success: true, data: { ...msg, conversationId: conversation.id } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const messageId = toNumber(req.params.messageId);
        if (isNaN(messageId)) {
            return res.status(400).json({ success: false, message: 'Invalid message ID' });
        }
        const userId = req.user.id;
        const message = await ChatService.markAsRead(messageId, userId);
        const io = getIO();
        if (io && message) {
            io.to(`user:${message.senderId}`).emit('message-read', { messageId, userId, readAt: new Date() });
        }
        res.json({ success: true, message: 'Message marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteMessage = async (req, res) => {
    try {
        const messageId = toNumber(req.params.messageId);
        if (isNaN(messageId)) {
            return res.status(400).json({ success: false, message: 'Invalid message ID' });
        }
        const userId = req.user.id;
        await ChatService.deleteMessage(messageId, userId);
        res.json({ success: true, message: 'Message deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await ChatService.getUnreadCount(userId);
        res.json({ success: true, data: { unreadCount: count } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getAvailableContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let contacts = [];
        if (userRole === 'TEACHER') {
            contacts = await ChatService.getTeacherStudents(userId);
        }
        else if (userRole === 'STUDENT') {
            contacts = await ChatService.getStudentTeachers(userId);
        }
        res.json({ success: true, data: contacts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const sendTypingIndicator = async (req, res) => {
    try {
        const { receiverId, isTyping } = req.body;
        const senderId = req.user.id;
        const io = getIO();
        if (io) {
            io.to(`user:${receiverId}`).emit('user-typing', { userId: senderId, isTyping });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const markConversationAsRead = async (req, res) => {
    try {
        const conversationId = toNumber(req.params.conversationId);
        if (isNaN(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversation ID' });
        }
        const userId = req.user.id;
        const conversation = await ChatService.getConversationById(conversationId, userId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }
        await prisma.message.updateMany({
            where: { conversationId, receiverId: userId, isRead: false },
            data: { isRead: true, readAt: new Date() }
        });
        const otherUserId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
        const io = getIO();
        if (io) {
            io.to(`user:${otherUserId}`).emit('conversation-read', { conversationId, userId });
        }
        res.json({ success: true, message: 'Conversation marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=chatController.js.map