import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import TokenService from './tokenService.js';

const prisma = new PrismaClient();

export default class AuthService {

  // ================= LOGIN =================
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        isValid: true
      }
    });

    return { user, accessToken, refreshToken };
  }

  // ================= SUPERADMIN → CREATE ADMIN =================
  static async createAdmin(data: any, creatorId: number) {

    // 1. check duplicate email
    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (exists) {
      throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    // 2. CREATE ADMIN (ROLE FIXED HERE)
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,

        role: 'ADMIN',        // 🔥 FIXED BY SYSTEM
        status: 'ACTIVE',
        isActive: true
      }
    });
  }

  // ================= ADMIN → CREATE TEACHER =================
  static async createTeacher(data: any, adminId: number) {

    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (exists) {
      throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,

        role: 'TEACHER',
        status: 'ACTIVE',
        isActive: true
      }
    });

    // create teacher profile
    await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: `EMP-${Date.now()}`
      }
    });

    return user;
  }

  // ================= PUBLIC REGISTER =================
  static async publicRegister(data: any) {

    // ❌ SECURITY FIX: role must NOT be trusted from frontend
    const allowedRoles = ['STUDENT', 'PARENT'];

    if (!allowedRoles.includes(data.role)) {
      throw new Error('Invalid role');
    }

    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (exists) {
      throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,

        role: data.role,
        status: 'PENDING',
        isActive: true
      }
    });
  }

  // ================= APPROVE / REJECT =================
  static async approveOrRejectUser(userId: number, action: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'
      }
    });
  }

  // ================= GET ME =================
  static async getMe(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId }
    });
  }

  // ================= GET ALL USERS =================
  static async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // ================= UPDATE USER =================
  static async updateUser(id: number, data: any) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  // ================= DELETE USER =================
  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id }
    });
  }
}