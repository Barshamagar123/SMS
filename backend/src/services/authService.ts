// ================= authService.ts =================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import TokenService from './tokenService.js';

const prisma = new PrismaClient();

export default class AuthService {

  // ================= LOGIN =================
  static async login(
    email: string,
    password: string
  ) {

    const user =
      await prisma.user.findUnique({
        where: { email }
      });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // account locked
    if (
      user.lockedUntil &&
      user.lockedUntil > new Date()
    ) {
      throw new Error(
        'Account temporarily locked'
      );
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    // wrong password
    if (!match) {

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts:
            user.failedAttempts + 1,

          lockedUntil:
            user.failedAttempts + 1 >= 5
              ? new Date(
                  Date.now() +
                  15 * 60 * 1000
                )
              : null
        }
      });

      throw new Error(
        'Invalid credentials'
      );
    }

    // reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

    const accessToken =
      TokenService.generateAccessToken(
        user
      );

    const refreshToken =
      TokenService.generateRefreshToken(
        user
      );

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        isValid: true
      }
    });

    return {
      user,
      accessToken,
      refreshToken
    };

  }


  // ================= CREATE ADMIN =================
  static async createAdmin(
    data: any,
    creatorId: number
  ) {

    const exists =
      await prisma.user.findUnique({
        where: {
          email: data.email
        }
      });

    if (exists) {
      throw new Error(
        'Email already exists'
      );
    }

    const hashed =
      await bcrypt.hash(
        data.password,
        10
      );

    return prisma.user.create({

      data: {
        email: data.email,
        password: hashed,
        name: data.name,

        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true
      }

    });

  }


  // ================= CREATE TEACHER =================
  static async createTeacher(
    data: any,
    adminId: number
  ) {

    const exists =
      await prisma.user.findUnique({
        where: {
          email: data.email
        }
      });

    if (exists) {
      throw new Error(
        'Email already exists'
      );
    }

    const hashed =
      await bcrypt.hash(
        data.password,
        10
      );

    const user =
      await prisma.user.create({

        data: {
          email: data.email,
          password: hashed,
          name: data.name,

          role: 'TEACHER',
          status: 'ACTIVE',
          isActive: true
        }

      });

    await prisma.teacher.create({

      data: {
        userId: user.id,
        employeeId: `EMP-${Date.now()}`
      }

    });

    return user;

  }


  // ================= PUBLIC REGISTER =================
  static async publicRegister(
    data: any
  ) {

    const allowedRoles = [
      'STUDENT',
      'PARENT'
    ];

    if (
      !allowedRoles.includes(data.role)
    ) {
      throw new Error(
        'Invalid role'
      );
    }

    const exists =
      await prisma.user.findUnique({
        where: {
          email: data.email
        }
      });

    if (exists) {
      throw new Error(
        'Email already exists'
      );
    }

    const hashed =
      await bcrypt.hash(
        data.password,
        10
      );

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
  static async approveOrRejectUser(
    userId: number,
    action: string
  ) {

    return prisma.user.update({

      where: {
        id: userId
      },

      data: {
        status:
          action === 'APPROVE'
            ? 'ACTIVE'
            : 'REJECTED'
      }

    });

  }


  // ================= GET ME =================
  static async getMe(
    userId: number
  ) {

    return prisma.user.findUnique({
      where: {
        id: userId
      }
    });

  }


  // ================= GET ALL USERS =================
  static async getAllUsers() {

    return prisma.user.findMany({

      orderBy: {
        createdAt: 'desc'
      }

    });

  }


  // ================= UPDATE USER =================
  static async updateUser(
    id: number,
    data: any
  ) {

    return prisma.user.update({

      where: { id },

      data

    });

  }


  // ================= DELETE USER =================
  static async deleteUser(
    id: number
  ) {

    return prisma.user.update({

      where: { id },

      data: {
        isActive: false
      }

    });

  }


  // ================= LOGOUT =================
  static async logout(
    refreshToken: string
  ) {

    await prisma.session.updateMany({

      where: {
        refreshToken
      },

      data: {
        isValid: false
      }

    });

  }


  // ================= REFRESH TOKEN =================
  static async refresh(
    refreshToken: string
  ) {

    const session =
      await prisma.session.findFirst({

        where: {
          refreshToken,
          isValid: true
        },

        include: {
          user: true
        }

      });

    if (!session) {

      throw new Error(
        'Invalid refresh token'
      );

    }

    const accessToken =
      TokenService.generateAccessToken(
        session.user
      );

    return { accessToken };

  }


  // ================= FORGOT PASSWORD =================
  static async forgotPassword(
    email: string
  ) {

    const user =
      await prisma.user.findUnique({

        where: { email }

      });

    if (!user) {

      throw new Error(
        'User not found'
      );

    }

    const token =
      crypto.randomBytes(32)
      .toString('hex');

    const expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );

    await prisma.passwordReset.create({

      data: {
        userId: user.id,
        token,
        expiresAt
      }

    });

    return { token };

  }


  // ================= RESET PASSWORD =================
  static async resetPassword(
    token: string,
    newPassword: string
  ) {

    const reset =
      await prisma.passwordReset.findFirst({

        where: {
          token,
          isUsed: false
        }

      });

    if (!reset) {

      throw new Error(
        'Invalid reset token'
      );

    }

    if (
      reset.expiresAt < new Date()
    ) {

      throw new Error(
        'Reset token expired'
      );

    }

    const hashed =
      await bcrypt.hash(
        newPassword,
        10
      );

    await prisma.user.update({

      where: {
        id: reset.userId
      },

      data: {
        password: hashed
      }

    });

    await prisma.passwordReset.update({

      where: {
        id: reset.id
      },

      data: {
        isUsed: true,
        usedAt: new Date()
      }

    });

  }


  // ================= CHANGE PASSWORD =================
  static async changePassword(

    userId: number,
    currentPassword: string,
    newPassword: string

  ) {

    const user =
      await prisma.user.findUnique({

        where: { id: userId }

      });

    if (!user) {

      throw new Error(
        'User not found'
      );

    }

    const match =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!match) {

      throw new Error(
        'Current password incorrect'
      );

    }

    const hashed =
      await bcrypt.hash(
        newPassword,
        10
      );

    await prisma.user.update({

      where: {
        id: userId
      },

      data: {
        password: hashed,
        isFirstLogin: false
      }

    });

  }

}