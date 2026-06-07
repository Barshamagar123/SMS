export declare class NotificationService {
    static sendToUser(userId: number, title: string, message: string, type: string, relatedId?: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
        userId: number;
        title: string;
        type: string;
        relatedId: number | null;
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
            id: number;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            isRead: boolean;
            userId: number;
            title: string;
            type: string;
            relatedId: number | null;
        }[];
        total: number;
        unreadCount: number;
    }>;
    static getNotificationById(notificationId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
        userId: number;
        title: string;
        type: string;
        relatedId: number | null;
    }>;
    static markAsRead(notificationId: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static markAllAsRead(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static deleteNotification(notificationId: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static deleteAllNotifications(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    static getUnreadCount(userId: number): Promise<number>;
}
