import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TokenService from './tokenService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();
export default class AuthService {
    // ================= LOGIN =================
    static async login(email, password) {
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
    static async createAdmin(data, creatorId) {
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
                phone: data.phone,
                role: 'ADMIN',
                status: 'ACTIVE',
                isActive: true
            }
        });
    }
    // ================= CREATE TEACHER =================
    static async createTeacher(data, adminId) {
        const exists = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (exists) {
            throw new Error('Email already exists');
        }
        // Validate required fields
        const requiredFields = ['email', 'name', 'qualification', 'specialization', 'phone', 'address', 'hireDate'];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        // Generate default password
        const defaultPassword = `Teacher@${Math.random().toString(36).slice(-6)}`;
        const hashed = await bcrypt.hash(defaultPassword, 10);
        // Create User account
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashed,
                name: data.name,
                role: 'TEACHER',
                status: 'ACTIVE',
                isActive: true,
                isFirstLogin: true,
                phone: data.phone
            }
        });
        // Generate Employee ID (TCH20250001 format)
        const year = new Date().getFullYear();
        const teacherCount = await prisma.teacher.count();
        const sequence = String(teacherCount + 1).padStart(4, '0');
        const employeeId = `TCH${year}${sequence}`;
        // Create Teacher profile
        const teacher = await prisma.teacher.create({
            data: {
                userId: user.id,
                employeeId: employeeId,
                qualification: data.qualification,
                specialization: data.specialization,
                phone: data.phone,
                address: data.address,
                hireDate: new Date(data.hireDate)
            },
            include: {
                user: true
            }
        });
        return {
            id: teacher.id,
            employeeId: teacher.employeeId,
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            qualification: teacher.qualification,
            specialization: teacher.specialization,
            address: teacher.address,
            hireDate: teacher.hireDate,
            defaultPassword: defaultPassword
        };
    }
    // ================= ADMIN: GET ALL TEACHERS =================
    static async getAllTeachers() {
        const teachers = await prisma.teacher.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isActive: true
                    }
                },
                teacherAssignments: {
                    include: {
                        classSubject: {
                            include: {
                                class: true,
                                subject: true
                            }
                        },
                        academicYear: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return teachers.map(teacher => ({
            id: teacher.id,
            employeeId: teacher.employeeId,
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            qualification: teacher.qualification,
            specialization: teacher.specialization,
            address: teacher.address,
            hireDate: teacher.hireDate,
            profilePhoto: teacher.profilePhoto,
            isActive: teacher.user.isActive,
            assignmentsCount: teacher.teacherAssignments.length,
            assignments: teacher.teacherAssignments.map(ta => ({
                class: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
                subject: ta.classSubject.subject.name,
                academicYear: ta.academicYear.year,
                isPrimary: ta.isPrimary
            }))
        }));
    }
    // ================= ADMIN: GET TEACHER BY ID =================
    static async getTeacherById(teacherId) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isActive: true
                    }
                },
                teacherAssignments: {
                    include: {
                        classSubject: {
                            include: {
                                class: true,
                                subject: true
                            }
                        },
                        academicYear: true
                    }
                }
            }
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        return {
            id: teacher.id,
            employeeId: teacher.employeeId,
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            qualification: teacher.qualification,
            specialization: teacher.specialization,
            address: teacher.address,
            hireDate: teacher.hireDate,
            profilePhoto: teacher.profilePhoto,
            isActive: teacher.user.isActive,
            assignments: teacher.teacherAssignments.map(ta => ({
                class: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
                subject: ta.classSubject.subject.name,
                academicYear: ta.academicYear.year,
                isPrimary: ta.isPrimary
            }))
        };
    }
    // ================= ADMIN: UPDATE TEACHER =================
    static async updateTeacher(teacherId, data, adminId) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true }
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        // Update User
        if (data.name || data.email || data.phone || data.isActive !== undefined) {
            await prisma.user.update({
                where: { id: teacher.userId },
                data: {
                    name: data.name || teacher.user.name,
                    email: data.email || teacher.user.email,
                    phone: data.phone !== undefined ? data.phone : teacher.user.phone,
                    isActive: data.isActive !== undefined ? data.isActive : teacher.user.isActive
                }
            });
        }
        // Update Teacher
        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                qualification: data.qualification !== undefined ? data.qualification : teacher.qualification,
                specialization: data.specialization !== undefined ? data.specialization : teacher.specialization,
                address: data.address !== undefined ? data.address : teacher.address,
                hireDate: data.hireDate ? new Date(data.hireDate) : teacher.hireDate
            },
            include: { user: true }
        });
        return {
            id: updatedTeacher.id,
            employeeId: updatedTeacher.employeeId,
            name: updatedTeacher.user.name,
            email: updatedTeacher.user.email,
            phone: updatedTeacher.user.phone,
            qualification: updatedTeacher.qualification,
            specialization: updatedTeacher.specialization,
            address: updatedTeacher.address,
            hireDate: updatedTeacher.hireDate,
            isActive: updatedTeacher.user.isActive
        };
    }
    // ================= ADMIN: DELETE TEACHER =================
    static async deleteTeacher(teacherId) {
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: { user: true }
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        // Soft delete - deactivate user
        await prisma.user.update({
            where: { id: teacher.userId },
            data: { isActive: false }
        });
        return { success: true, teacherName: teacher.user.name };
    }
    // ================= TEACHER: GET OWN PROFILE =================
    static async getOwnTeacherProfile(userId) {
        const teacher = await prisma.teacher.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                teacherAssignments: {
                    where: {
                        academicYear: { isActive: true }
                    },
                    include: {
                        classSubject: {
                            include: {
                                class: true,
                                subject: true
                            }
                        }
                    }
                }
            }
        });
        if (!teacher) {
            throw new Error('Teacher profile not found');
        }
        return {
            id: teacher.id,
            employeeId: teacher.employeeId,
            name: teacher.user.name,
            email: teacher.user.email,
            phone: teacher.user.phone,
            qualification: teacher.qualification,
            specialization: teacher.specialization,
            address: teacher.address,
            hireDate: teacher.hireDate,
            profilePhoto: teacher.profilePhoto,
            currentClasses: teacher.teacherAssignments.map(ta => ({
                class: `${ta.classSubject.class.name} ${ta.classSubject.class.section}`,
                subject: ta.classSubject.subject.name,
                isPrimary: ta.isPrimary
            }))
        };
    }
    // ================= TEACHER: UPLOAD PROFILE PHOTO =================
    static async uploadTeacherProfilePhoto(userId, file) {
        const teacher = await prisma.teacher.findUnique({
            where: { userId }
        });
        if (!teacher) {
            if (file)
                fs.unlinkSync(file.path);
            throw new Error('Teacher profile not found');
        }
        // Delete old photo if exists
        if (teacher.profilePhoto) {
            const oldPhotoPath = path.join(process.cwd(), teacher.profilePhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }
        // Update teacher with new photo URL
        const photoUrl = `/uploads/teachers/${file.filename}`;
        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacher.id },
            data: { profilePhoto: photoUrl }
        });
        return {
            profilePhoto: updatedTeacher.profilePhoto,
            photoUrl: `http://localhost:${process.env.PORT || 3000}${photoUrl}`
        };
    }
    // ================= TEACHER: GET PROFILE PHOTO =================
    static async getTeacherProfilePhoto(userId) {
        const teacher = await prisma.teacher.findUnique({
            where: { userId }
        });
        if (!teacher || !teacher.profilePhoto) {
            return null;
        }
        const photoPath = path.join(process.cwd(), teacher.profilePhoto);
        if (!fs.existsSync(photoPath)) {
            return null;
        }
        return photoPath;
    }
    // ================= TEACHER: DELETE PROFILE PHOTO =================
    static async deleteTeacherProfilePhoto(userId) {
        const teacher = await prisma.teacher.findUnique({
            where: { userId }
        });
        if (!teacher) {
            throw new Error('Teacher profile not found');
        }
        // Delete physical file
        if (teacher.profilePhoto) {
            const photoPath = path.join(process.cwd(), teacher.profilePhoto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        // Update database
        await prisma.teacher.update({
            where: { id: teacher.id },
            data: { profilePhoto: null }
        });
        return { success: true };
    }
    // ================= CREATE STUDENT (ADMIN ONLY) =================
    static async createStudent(data, adminId) {
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
    // ================= TRANSFER STUDENT METHODS =================
    // Get student by ID with class details
    static async getStudentById(studentId) {
        return prisma.student.findUnique({
            where: { id: studentId },
            include: {
                class: true,
                user: true
            }
        });
    }
    // Get class by ID
    static async getClassById(classId) {
        return prisma.class.findUnique({
            where: { id: classId }
        });
    }
    // Transfer student to new class
    static async transferStudent(studentId, newClassId, reason, transferredBy) {
        return prisma.student.update({
            where: { id: studentId },
            data: { classId: newClassId },
            include: {
                user: true,
                class: true
            }
        });
    }
    // ================= PUBLIC REGISTER (BLOCK STUDENTS) =================
    static async publicRegister(data) {
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
    static async approveOrRejectUser(userId, action) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'
            }
        });
    }
    // ================= GET ME =================
    static async getMe(userId) {
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
                where: { userId: user.id },
                include: { user: true }
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
        const users = await prisma.user.findMany({
            include: {
                student: {
                    include: { class: true }
                },
                teacher: true,
                parent: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: user.status,
            isActive: user.isActive,
            createdAt: user.createdAt,
            student: user.student ? {
                id: user.student.id,
                rollNumber: user.student.rollNumber,
                classId: user.student.classId
            } : null,
            teacher: user.teacher ? {
                id: user.teacher.id,
                employeeId: user.teacher.employeeId,
                qualification: user.teacher.qualification,
                specialization: user.teacher.specialization
            } : null,
            parent: user.parent ? {
                id: user.parent.id
            } : null
        }));
    }
    // ================= UPDATE USER =================
    static async updateUser(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }
    // ================= DELETE USER (ENHANCED - UPDATED) =================
    static async deleteUser(id) {
        // First check if user exists
        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Soft delete - update isActive to false AND status to 'REJECTED'
        return prisma.user.update({
            where: { id },
            data: {
                isActive: false,
                status: 'REJECTED'
            }
        });
    }
    // ================= LOGOUT =================
    static async logout(refreshToken) {
        await prisma.session.updateMany({
            where: { refreshToken },
            data: { isValid: false }
        });
    }
    // ================= REFRESH TOKEN =================
    static async refresh(refreshToken) {
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
    static async forgotPassword(email) {
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
    static async resetPassword(token, newPassword) {
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
    static async changePassword(userId, currentPassword, newPassword) {
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
    static async getStudentByUserId(userId) {
        return prisma.student.findUnique({
            where: { userId }
        });
    }
    // Get student with full details (including user and class)
    static async getStudentWithDetails(userId) {
        return prisma.student.findUnique({
            where: { userId },
            include: {
                user: true,
                class: true
            }
        });
    }
    // Update student profile photo
    static async updateStudentPhoto(studentId, photoUrl) {
        return prisma.student.update({
            where: { id: studentId },
            data: { profilePhoto: photoUrl }
        });
    }
    // Update student profile (limited fields)
    static async updateStudentProfile(userId, data) {
        const student = await prisma.student.findUnique({
            where: { userId }
        });
        if (!student) {
            throw new Error('Student not found');
        }
        const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
                phone: data.phone !== undefined ? data.phone : student.phone,
                address: data.address !== undefined ? data.address : student.address,
                city: data.city !== undefined ? data.city : student.city,
                state: data.state !== undefined ? data.state : student.state,
            }
        });
        if (data.phone) {
            await prisma.user.update({
                where: { id: userId },
                data: { phone: data.phone }
            });
        }
        return updatedStudent;
    }
    // ================= NEW: SUPERADMIN/ADMIN STUDENT MANAGEMENT METHODS =================
    // ================= GET ALL STUDENTS WITH FULL DETAILS =================
    static async getAllStudentsWithDetails() {
        const students = await prisma.student.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isActive: true,
                        isFirstLogin: true,
                        status: true,
                        createdAt: true,
                        lastLoginAt: true
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        section: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return students.map(student => ({
            id: student.user.id,
            name: student.user.name,
            email: student.user.email,
            phone: student.user.phone,
            role: 'STUDENT',
            isActive: student.user.isActive,
            isFirstLogin: student.user.isFirstLogin,
            status: student.user.status,
            createdAt: student.user.createdAt,
            lastLoginAt: student.user.lastLoginAt,
            student: {
                id: student.id,
                rollNumber: student.rollNumber,
                classId: student.classId,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                bloodGroup: student.bloodGroup,
                nationality: student.nationality,
                religion: student.religion,
                address: student.address,
                city: student.city,
                state: student.state,
                phone: student.phone,
                fatherName: student.fatherName,
                motherName: student.motherName,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail,
                admissionDate: student.admissionDate,
                previousSchool: student.previousSchool,
                previousClass: student.previousClass,
                profilePhoto: student.profilePhoto,
                isActive: student.isActive,
                class: student.class ? {
                    id: student.class.id,
                    name: student.class.name,
                    section: student.class.section
                } : null
            }
        }));
    }
    // ================= GET ALL ADMINS =================
    static async getAllAdmins() {
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive: true,
                isFirstLogin: true,
                status: true,
                createdAt: true,
                lastLoginAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return admins;
    }
    // ================= GET STUDENT DETAILS BY ID =================
    static async getStudentDetailsById(studentId) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isActive: true,
                        isFirstLogin: true,
                        status: true,
                        createdAt: true,
                        lastLoginAt: true
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                        section: true
                    }
                }
            }
        });
        if (!student) {
            throw new Error('Student not found');
        }
        return {
            id: student.user.id,
            name: student.user.name,
            email: student.user.email,
            phone: student.user.phone,
            role: 'STUDENT',
            isActive: student.user.isActive,
            isFirstLogin: student.user.isFirstLogin,
            status: student.user.status,
            createdAt: student.user.createdAt,
            lastLoginAt: student.user.lastLoginAt,
            student: {
                id: student.id,
                rollNumber: student.rollNumber,
                classId: student.classId,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                bloodGroup: student.bloodGroup,
                nationality: student.nationality,
                religion: student.religion,
                address: student.address,
                city: student.city,
                state: student.state,
                phone: student.phone,
                fatherName: student.fatherName,
                motherName: student.motherName,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail,
                admissionDate: student.admissionDate,
                previousSchool: student.previousSchool,
                previousClass: student.previousClass,
                profilePhoto: student.profilePhoto,
                isActive: student.isActive,
                class: student.class ? {
                    id: student.class.id,
                    name: student.class.name,
                    section: student.class.section
                } : null
            }
        };
    }
    // ================= GET STUDENT PHOTO BY ID =================
    static async getStudentPhotoById(studentId) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { profilePhoto: true }
        });
        if (!student || !student.profilePhoto) {
            return null;
        }
        const photoPath = path.join(process.cwd(), student.profilePhoto);
        if (!fs.existsSync(photoPath)) {
            return null;
        }
        return photoPath;
    }
    // ================= UPDATE STUDENT STATUS =================
    static async updateStudentStatus(studentId, isActive) {
        // First find the student to get userId
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });
        if (!student) {
            throw new Error('Student not found');
        }
        // Update user active status
        const updatedUser = await prisma.user.update({
            where: { id: student.userId },
            data: { isActive: isActive }
        });
        // Update student isActive status
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { isActive: isActive }
        });
        return {
            userId: updatedUser.id,
            studentId: updatedStudent.id,
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive
        };
    }
    // ================= RESET STUDENT PASSWORD =================
    static async resetStudentPassword(studentId) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });
        if (!student) {
            throw new Error('Student not found');
        }
        // Generate new random password
        const newPassword = `Student@${Math.random().toString(36).slice(-6)}`;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update user password
        await prisma.user.update({
            where: { id: student.userId },
            data: {
                password: hashedPassword,
                isFirstLogin: true
            }
        });
        return {
            studentId: student.id,
            name: student.user.name,
            email: student.user.email,
            newPassword: newPassword
        };
    }
    // ================= GET STUDENT STATISTICS =================
    static async getStudentStatistics() {
        const totalStudents = await prisma.student.count();
        const activeStudents = await prisma.student.count({
            where: { isActive: true }
        });
        const maleStudents = await prisma.student.count({
            where: { gender: 'MALE' }
        });
        const femaleStudents = await prisma.student.count({
            where: { gender: 'FEMALE' }
        });
        // Students by class
        const studentsByClass = await prisma.$queryRaw `
      SELECT c.name, c.section, COUNT(s.id) as count
      FROM students s
      JOIN classes c ON s.class_id = c.id
      GROUP BY c.id, c.name, c.section
      ORDER BY c.name, c.section
    `;
        // Students by blood group
        const studentsByBloodGroup = await prisma.$queryRaw `
      SELECT blood_group, COUNT(*) as count
      FROM students
      WHERE blood_group IS NOT NULL
      GROUP BY blood_group
    `;
        // New students this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newStudentsThisMonth = await prisma.student.count({
            where: {
                createdAt: {
                    gte: startOfMonth
                }
            }
        });
        return {
            total: totalStudents,
            active: activeStudents,
            inactive: totalStudents - activeStudents,
            gender: {
                male: maleStudents,
                female: femaleStudents,
                other: totalStudents - maleStudents - femaleStudents
            },
            newThisMonth: newStudentsThisMonth,
            byClass: studentsByClass,
            byBloodGroup: studentsByBloodGroup
        };
    }
    // ================= EXPORT STUDENTS DATA =================
    static async exportStudentsData(format) {
        const students = await this.getAllStudentsWithDetails();
        // Create CSV header
        const headers = [
            'Name', 'Email', 'Phone', 'Roll Number', 'Class', 'Section',
            'Date of Birth', 'Gender', 'Blood Group', 'Nationality', 'Religion',
            'Father Name', 'Mother Name', 'Parent Phone', 'Parent Email',
            'Address', 'City', 'State', 'Admission Date', 'Status'
        ];
        // Create CSV rows
        const rows = students.map(s => [
            s.name,
            s.email,
            s.phone || '',
            s.student?.rollNumber || '',
            s.student?.class?.name || '',
            s.student?.class?.section || '',
            s.student?.dateOfBirth ? new Date(s.student.dateOfBirth).toLocaleDateString() : '',
            s.student?.gender || '',
            s.student?.bloodGroup || '',
            s.student?.nationality || '',
            s.student?.religion || '',
            s.student?.fatherName || '',
            s.student?.motherName || '',
            s.student?.parentPhone || '',
            s.student?.parentEmail || '',
            s.student?.address || '',
            s.student?.city || '',
            s.student?.state || '',
            s.student?.admissionDate ? new Date(s.student.admissionDate).toLocaleDateString() : '',
            s.isActive ? 'Active' : 'Inactive'
        ]);
        // Convert to CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        return csvContent;
    }
}
//# sourceMappingURL=authService.js.map