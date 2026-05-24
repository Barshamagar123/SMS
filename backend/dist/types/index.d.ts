import { Request } from 'express';
import { RoleEnum } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: RoleEnum;
        name: string;
        email?: string;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    timestamp: string;
}
