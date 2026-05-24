import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare const createSubject: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllSubjects: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateSubject: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteSubject: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSubjectById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
