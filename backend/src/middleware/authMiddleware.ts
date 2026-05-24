import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import TokenService from '../services/tokenService.js';
import { AuthenticatedRequest } from '../types/index.js';

const prisma = new PrismaClient();

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  let token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }

  // Strip surrounding quotes if present (common copy-paste error from JSON responses)
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  if (token.startsWith("'") && token.endsWith("'")) {
    token = token.slice(1, -1);
  }

  try {
    const decoded = TokenService.verifyAccessToken(token) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (!user.isActive || user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your account is deactivated or pending approval' });
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (err: any) {
    const decodedPayload = TokenService.decodeToken(token);
    console.error('🔥 JWT Authentication error:', err);
    console.error('Decoded unverified token payload:', decodedPayload);
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: err.message,
      decodedPayload
    });
  }
};


// ONLY SUPERADMIN
export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'SUPERADMIN') {
    return res.status(403).json({ message: 'SuperAdmin only' });
  }
  next();
};

// ADMIN OR SUPERADMIN
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};
// GLOBAL ERROR HANDLER (FIX FOR YOUR IMPORT ERROR)
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};