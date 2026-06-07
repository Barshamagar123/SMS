import { ConversationWithUser } from '../types/chat.js';
export declare class ChatService {
    static getOrCreateConversation(user1Id: number, user2Id: number): Promise<{
        id: number;
        participant1Id: number;
        participant2Id: number;
        lastMessage: string | null;
        lastMessageAt: Date;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    static getConversationById(conversationId: number, userId: number): Promise<{
        id: number;
        participant1Id: number;
        participant2Id: number;
        lastMessage: string | null;
        lastMessageAt: Date;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    } | null>;
    static getUserConversations(userId: number): Promise<ConversationWithUser[]>;
    static getMessages(conversationId: number, userId: number, limit?: number, offset?: number): Promise<({
        sender: {
            id: number;
            name: string;
            role: import("@prisma/client").$Enums.RoleEnum;
        };
        receiver: {
            id: number;
            name: string;
            role: import("@prisma/client").$Enums.RoleEnum;
        };
    } & {
        id: number;
        createdAt: Date;
        message: string;
        conversationId: number;
        senderId: number;
        receiverId: number;
        attachmentUrl: string | null;
        attachmentType: string | null;
        isRead: boolean;
        readAt: Date | null;
        isDeleted: boolean;
        deletedFor: number | null;
    })[]>;
    static sendMessage(conversationId: number, senderId: number, receiverId: number, message: string, attachmentUrl?: string, attachmentType?: string): Promise<{
        sender: {
            id: number;
            name: string;
            role: import("@prisma/client").$Enums.RoleEnum;
        };
        receiver: {
            id: number;
            name: string;
            role: import("@prisma/client").$Enums.RoleEnum;
        };
    } & {
        id: number;
        createdAt: Date;
        message: string;
        conversationId: number;
        senderId: number;
        receiverId: number;
        attachmentUrl: string | null;
        attachmentType: string | null;
        isRead: boolean;
        readAt: Date | null;
        isDeleted: boolean;
        deletedFor: number | null;
    }>;
    static markAsRead(messageId: number, userId: number): Promise<{
        sender: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        message: string;
        conversationId: number;
        senderId: number;
        receiverId: number;
        attachmentUrl: string | null;
        attachmentType: string | null;
        isRead: boolean;
        readAt: Date | null;
        isDeleted: boolean;
        deletedFor: number | null;
    }>;
    static getUnreadCount(userId: number): Promise<number>;
    static getStudentTeachers(studentUserId: number): Promise<any[]>;
    static getTeacherStudents(teacherUserId: number): Promise<any[]>;
    static deleteMessage(messageId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        message: string;
        conversationId: number;
        senderId: number;
        receiverId: number;
        attachmentUrl: string | null;
        attachmentType: string | null;
        isRead: boolean;
        readAt: Date | null;
        isDeleted: boolean;
        deletedFor: number | null;
    }>;
}
export default ChatService;
