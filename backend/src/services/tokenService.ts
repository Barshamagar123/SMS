// @ts-nocheck
import jwt from 'jsonwebtoken';

export default class TokenService {
  static generateAccessToken(user: any) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    
    if (!secret) throw new Error('JWT_SECRET not defined');
    
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email 
      },
      secret,
      { expiresIn }
    );
  }

  static generateRefreshToken(user: any) {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    if (!secret) throw new Error('JWT_REFRESH_SECRET not defined');
    
    return jwt.sign(
      { userId: user.id, timestamp: Date.now() },
      secret,
      { expiresIn }
    );
  }

  static verifyAccessToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not defined');
    return jwt.verify(token, secret);
  }

  static verifyRefreshToken(token: string) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET not defined');
    return jwt.verify(token, secret);
  }

  static decodeToken(token: string) {
    return jwt.decode(token);
  }
}