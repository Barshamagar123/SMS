import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
// ONLY SUPERADMIN
export const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'SUPERADMIN') {
        return res.status(403).json({ message: 'SuperAdmin only' });
    }
    next();
};
// ADMIN OR SUPERADMIN
export const requireAdmin = (req, res, next) => {
    if (!req.user || !['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
};
// GLOBAL ERROR HANDLER (FIX FOR YOUR IMPORT ERROR)
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};
//# sourceMappingURL=authMiddleware.js.map