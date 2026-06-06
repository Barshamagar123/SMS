import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare const initializeSocket: (server: HttpServer) => SocketServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | null;
export declare const getIO: () => SocketServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any> | null;
export declare const sendNotificationToUser: (userId: number, notification: any) => void;
export declare const sendNotificationToClass: (classId: number, notification: any) => void;
export declare const sendNotificationToRole: (role: string, notification: any) => void;
export declare const updateUnreadCount: (userId: number) => Promise<void>;
