export declare class NotificationService {
    static sendToUser(userId: number, title: string, message: string, type: string, relatedId?: number): Promise<{
        message: string;
        title: string;
        type: string;
        isRead: boolean;
        createdAt: Date;
        updatedAt: Date;
        relatedId: number | null;
        id: number;
        userId: number;
    }>;
    static sendToMany(userIds: number[], title: string, message: string, type: string, relatedId?: number): Promise<{
        userId: number;
        title: string;
        message: string;
        type: string;
        relatedId: number | null;
    }[]>;
    static sendToClass(classId: number, title: string, message: string, type: string, relatedId?: number): Promise<{
        userId: number;
        title: string;
        message: string;
        type: string;
        relatedId: number | null;
    }[]>;
    static sendToRole(role: string, title: string, message: string, type: string, relatedId?: number): Promise<{
        userId: number;
        title: string;
        message: string;
        type: string;
        relatedId: number | null;
    }[]>;
    static getUserNotifications(userId: number, page?: number, limit?: number): Promise<{
        notifications: {
            message: string;
            title: string;
            type: string;
            isRead: boolean;
            createdAt: Date;
            updatedAt: Date;
            relatedId: number | null;
            id: number;
            userId: number;
        }[];
        total: number;
        unreadCount: number;
    }>;
    static getNotificationById(notificationId: number, userId: number): Promise<{
        message: string;
        title: string;
        type: string;
        isRead: boolean;
        createdAt: Date;
        updatedAt: Date;
        relatedId: number | null;
        id: number;
        userId: number;
    }>;
    static markAsRead(notificationId: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static markAllAsRead(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static deleteNotification(notificationId: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static deleteAllNotifications(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static getUnreadCount(userId: number): Promise<number>;
}
