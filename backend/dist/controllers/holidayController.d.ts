import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare const getHolidays: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addHoliday: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteHoliday: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMonthlyReportWithHolidays: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
