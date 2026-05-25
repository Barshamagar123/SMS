import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare const uploadPhoto: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
declare class AuthController {
    login: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createAdmin: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createTeacher: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createStudent: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    publicRegister: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    approveOrRejectUser: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getMe: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAllUsers: (_req: any, res: Response) => Promise<void>;
    updateUser: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    refresh: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    forgotPassword: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    resetPassword: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    changePassword: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getOwnProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateOwnProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    uploadOwnProfilePhoto: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getOwnProfilePhoto: (req: AuthenticatedRequest, res: Response) => Promise<void | Response<any, Record<string, any>>>;
    deleteOwnProfilePhoto: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
}
declare const _default: AuthController;
export default _default;
