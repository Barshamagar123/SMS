import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare const downloadReportCard: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStudentsForBulkDownload: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const bulkDownloadReportCards: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
