import jwt from 'jsonwebtoken';
export default class TokenService {
    static generateAccessToken(user: any): never;
    static generateRefreshToken(user: any): never;
    static verifyAccessToken(token: string): string | jwt.JwtPayload;
    static verifyRefreshToken(token: string): string | jwt.JwtPayload;
    static decodeToken(token: string): string | jwt.JwtPayload | null;
}
