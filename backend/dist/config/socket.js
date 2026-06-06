// backend/src/config/socket.ts
import { Server as SocketServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
let io = null;
let isInitialized = false;
export const initializeSocket = (server) => {
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
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                socket.data.userId = decoded.id;
                socket.data.role = decoded.role;
                next();
            }
            catch (err) {
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
                }
                catch (error) {
                    console.error('Error fetching student class:', error);
                }
            }
            // Send unread count
            try {
                const unreadCount = await prisma.notification.count({
                    where: { userId, isRead: false }
                });
                socket.emit('unread-count', unreadCount);
            }
            catch (error) {
                console.error('Error fetching unread count:', error);
            }
            socket.on('disconnect', () => {
                console.log(`❌ User ${userId} disconnected`);
            });
        });
        isInitialized = true;
        console.log('✅ Socket.io initialized successfully');
        return io;
    }
    catch (error) {
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
export const sendNotificationToUser = (userId, notification) => {
    const socket = getIO();
    if (socket) {
        socket.to(`user:${userId}`).emit('new-notification', notification);
    }
};
export const sendNotificationToClass = (classId, notification) => {
    const socket = getIO();
    if (socket) {
        socket.to(`class:${classId}`).emit('new-notification', notification);
    }
};
export const sendNotificationToRole = (role, notification) => {
    const socket = getIO();
    if (socket) {
        socket.to(`role:${role}`).emit('new-notification', notification);
    }
};
export const updateUnreadCount = async (userId) => {
    const socket = getIO();
    if (!socket)
        return;
    const newPrisma = new PrismaClient();
    try {
        const count = await newPrisma.notification.count({
            where: { userId, isRead: false }
        });
        socket.to(`user:${userId}`).emit('unread-count', count);
    }
    catch (error) {
        console.error('Error updating unread count:', error);
    }
    finally {
        await newPrisma.$disconnect();
    }
};
//# sourceMappingURL=socket.js.map