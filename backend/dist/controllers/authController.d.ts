import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
declare class AuthController {
    login: (req: any, res: Response) => Promise<void>;
    createAdmin: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    createTeacher: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    publicRegister: (req: any, res: Response) => Promise<void>;
    approveOrRejectUser: (req: any, res: Response) => Promise<void>;
    getMe: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    getAllUsers: (_req: any, res: Response) => Promise<void>;
    updateUser: (req: any, res: Response) => Promise<void>;
    deleteUser: (req: any, res: Response) => Promise<void>;
}
declare const _default: AuthController;
export default _default;
