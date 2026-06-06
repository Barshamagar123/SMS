import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare const getMyNotifications: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUnreadCount: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const markAsRead: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markAllAsRead: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getNotificationById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteNotification: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAllNotifications: (req: AuthenticatedRequest, res: Response) => Promise<void>;
