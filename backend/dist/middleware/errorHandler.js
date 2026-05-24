import { Prisma } from '@prisma/client';
export const errorHandler = (err, req, res, next) => {
    console.error('🔥 Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                return res.status(409).json({
                    success: false,
                    message: 'Duplicate entry found',
                    error: `${err.meta?.target} already exists`,
                    timestamp: new Date().toISOString()
                });
            case 'P2025':
                return res.status(404).json({
                    success: false,
                    message: 'Record not found',
                    timestamp: new Date().toISOString()
                });
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Database error',
                    timestamp: new Date().toISOString()
                });
        }
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            timestamp: new Date().toISOString()
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired. Please login again.',
            timestamp: new Date().toISOString()
        });
    }
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
    });
};
//# sourceMappingURL=errorHandler.js.map