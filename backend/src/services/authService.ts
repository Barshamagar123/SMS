// ================= authService.ts =================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import TokenService from './tokenService.js';

const prisma = new PrismaClient();

export default class AuthService {

  // ================= LOGIN =================
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account temporarily locked');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: user.failedAttempts + 1,
          lockedUntil: user.failedAttempts + 1 >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null
        }
      });
      throw new Error('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    });

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

  // ================= CREATE ADMIN =================
  static async createAdmin(data: any, creatorId: number) {
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
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true
      }
    });
  }

  // ================= CREATE TEACHER =================
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

    await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: `EMP-${Date.now()}`
      }
    });

    return user;
  }

  // ================= CREATE STUDENT (ADMIN ONLY) =================
  static async createStudent(data: any, adminId: number) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (exists) {
      throw new Error('Email already exists');
    }

    const classExists = await prisma.class.findUnique({
      where: { id: data.classId }
    });

    if (!classExists) {
      throw new Error('Class not found');
    }

    const year = new Date().getFullYear();
    const studentCount = await prisma.student.count();
    const sequence = String(studentCount + 1).padStart(6, '0');
    const rollNumber = `STU${year}${sequence}`;

    const defaultPassword = `Student@${rollNumber.slice(-6)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'STUDENT',
        status: 'ACTIVE',
        isActive: true,
        isFirstLogin: true,
        phone: data.phone || null
      }
    });

    const student = await prisma.student.create({
      data: {
        rollNumber: rollNumber,
        userId: user.id,
        classId: data.classId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
        nationality: data.nationality || 'Indian',
        religion: data.religion || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        phone: data.phone || null,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        parentPhone: data.parentPhone || null,
        parentEmail: data.parentEmail || null,
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
        previousSchool: data.previousSchool || null,
        previousClass: data.previousClass || null,
        profilePhoto: data.profilePhoto || null
      },
      include: {
        class: true,
        user: true
      }
    });

    return {
      id: student.id,
      rollNumber: student.rollNumber,
      name: student.user.name,
      email: student.user.email,
      class: `${student.class.name} ${student.class.section}`,
      defaultPassword: defaultPassword
    };
  }

  // ================= PUBLIC REGISTER (BLOCK STUDENTS) =================
  static async publicRegister(data: any) {
    if (data.role === 'STUDENT') {
      throw new Error('Student registration is not allowed publicly. Please contact school admin.');
    }

    const allowedRoles = ['PARENT'];

    if (!allowedRoles.includes(data.role)) {
      throw new Error('Invalid role for public registration');
    }

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
        role: data.role,
        status: 'PENDING',
        isActive: true
      }
    });

    if (data.role === 'PARENT') {
      await prisma.parent.create({
        data: { userId: user.id }
      });
    }

    return user;
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
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { class: true }
      });
      return { ...user, student };
    }

    if (user?.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id }
      });
      return { ...user, teacher };
    }

    if (user?.role === 'PARENT') {
      const parent = await prisma.parent.findUnique({
        where: { userId: user.id }
      });
      return { ...user, parent };
    }

    return user;
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
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // ================= LOGOUT =================
  static async logout(refreshToken: string) {
    await prisma.session.updateMany({
      where: { refreshToken },
      data: { isValid: false }
    });
  }

  // ================= REFRESH TOKEN =================
  static async refresh(refreshToken: string) {
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        isValid: true
      },
      include: { user: true }
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = TokenService.generateAccessToken(session.user);
    return { accessToken };
  }

  // ================= FORGOT PASSWORD =================
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

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
  static async resetPassword(token: string, newPassword: string) {
    const reset = await prisma.passwordReset.findFirst({
      where: {
        token,
        isUsed: false
      }
    });

    if (!reset) {
      throw new Error('Invalid reset token');
    }

    if (reset.expiresAt < new Date()) {
      throw new Error('Reset token expired');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed }
    });

    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });
  }

  // ================= CHANGE PASSWORD =================
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      throw new Error('Current password incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        isFirstLogin: false
      }
    });
  }

  // ================= STUDENT PROFILE METHODS =================
  
  // Get student by user ID
  static async getStudentByUserId(userId: number) {
    return prisma.student.findUnique({
      where: { userId }
    });
  }

  // Get student with full details (including user and class)
  static async getStudentWithDetails(userId: number) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true
      }
    });
  }

  // Update student profile photo
  static async updateStudentPhoto(studentId: number, photoUrl: string | null) {
    return prisma.student.update({
      where: { id: studentId },
      data: { profilePhoto: photoUrl }
    });
  }

  // Update student profile (limited fields)
  static async updateStudentProfile(userId: number, data: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) {
    // First find student by userId
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        phone: data.phone !== undefined ? data.phone : student.phone,
        address: data.address !== undefined ? data.address : student.address,
        city: data.city !== undefined ? data.city : student.city,
        state: data.state !== undefined ? data.state : student.state,
      }
    });

    // Update phone in User table if provided
    if (data.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: data.phone }
      });
    }

    return updatedStudent;
  }

}

// No duplicate export default here - it's already at the top