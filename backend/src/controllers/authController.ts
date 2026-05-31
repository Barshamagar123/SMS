import { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import AuthService from '../services/authService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { uploadStudentPhoto, uploadTeacherPhoto } from '../config/multerConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export multer middleware for photo upload
export const uploadStudentPhotoMiddleware = uploadStudentPhoto.single('photo');
export const uploadTeacherPhotoMiddleware = uploadTeacherPhoto.single('photo');

// Helper function to safely convert params to number
const toInt = (val: string | string[] | undefined): number => {
  if (!val) return NaN;
  return parseInt(val as string, 10);
};

class AuthController {

  // ================= LOGIN =================
  login = async (req: any, res: Response) => {

    try {

      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const data = await AuthService.login(email, password);

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= SUPERADMIN → CREATE ADMIN =================
  createAdmin = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { email, password, name, phone } = req.body;

      // Validate required fields
      const missingFields: string[] = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!name) missingFields.push('name');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const data = await AuthService.createAdmin(req.body, req.user!.id);

      res.json({
        success: true,
        message: "Admin created successfully",
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN → CREATE TEACHER =================
  createTeacher = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { email, name, qualification, specialization, phone, address, hireDate } = req.body;

      // Validate required fields
      const missingFields: string[] = [];
      if (!email) missingFields.push('email');
    
      if (!name) missingFields.push('name');
      if (!qualification) missingFields.push('qualification');
      if (!specialization) missingFields.push('specialization');
      if (!phone) missingFields.push('phone');
      if (!address) missingFields.push('address');
      if (!hireDate) missingFields.push('hireDate');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const data = await AuthService.createTeacher(req.body, req.user!.id);

      res.json({
        success: true,
        message: "Teacher created successfully",
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN: GET ALL TEACHERS =================
  getAllTeachers = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const data = await AuthService.getAllTeachers();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN: GET TEACHER BY ID =================
  getTeacherById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { id } = req.params;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      const data = await AuthService.getTeacherById(teacherId);

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN: UPDATE TEACHER =================
  updateTeacher = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { id } = req.params;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      const data = await AuthService.updateTeacher(teacherId, req.body, req.user!.id);

      res.json({
        success: true,
        message: "Teacher updated successfully",
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN: DELETE TEACHER =================
  deleteTeacher = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { id } = req.params;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      await AuthService.deleteTeacher(teacherId);

      res.json({
        success: true,
        message: "Teacher deleted successfully",
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= TEACHER: GET OWN PROFILE =================
  getOwnTeacherProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const user = req.user;

      if (!user || user.role !== 'TEACHER') {
        return res.status(403).json({
          success: false,
          message: 'Only teachers can access this'
        });
      }

      const data = await AuthService.getOwnTeacherProfile(user.id);

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= TEACHER: UPLOAD PROFILE PHOTO =================
  uploadTeacherProfilePhoto = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const user = req.user;
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select an image file'
        });
      }

      if (!user || user.role !== 'TEACHER') {
        if (file) fs.unlinkSync(file.path);
        return res.status(403).json({
          success: false,
          message: 'Only teachers can upload their profile photo'
        });
      }

      const data = await AuthService.uploadTeacherProfilePhoto(user.id, file);

      res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= TEACHER: GET PROFILE PHOTO =================
  getTeacherProfilePhoto = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const user = req.user;

      if (!user || user.role !== 'TEACHER') {
        return res.status(403).json({
          success: false,
          message: 'Only teachers can access this'
        });
      }

      const photoPath = await AuthService.getTeacherProfilePhoto(user.id);

      if (!photoPath) {
        return res.status(404).json({
          success: false,
          message: 'Profile photo not found'
        });
      }

      return res.sendFile(photoPath);

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= TEACHER: DELETE PROFILE PHOTO =================
  deleteTeacherProfilePhoto = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const user = req.user;

      if (!user || user.role !== 'TEACHER') {
        return res.status(403).json({
          success: false,
          message: 'Only teachers can delete their profile photo'
        });
      }

      await AuthService.deleteTeacherProfilePhoto(user.id);

      res.json({
        success: true,
        message: 'Profile photo deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };

  // ================= ADMIN: GET TEACHER PHOTO BY ID (For SuperAdmin/Admin) =================
  getTeacherPhotoById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      console.log(`📸 Fetching photo for teacher ID: ${teacherId}`);
      
      const photoPath = await AuthService.getTeacherPhotoById(teacherId);

      if (!photoPath) {
        console.log(`❌ No photo found for teacher ID: ${teacherId}`);
        return res.status(404).json({
          success: false,
          message: 'Profile photo not found'
        });
      }

      console.log(`✅ Photo found at: ${photoPath}`);
      
      // Check if file exists
      if (!fs.existsSync(photoPath)) {
        console.log(`❌ File does not exist at: ${photoPath}`);
        return res.status(404).json({
          success: false,
          message: 'Photo file not found on server'
        });
      }

      return res.sendFile(photoPath);
    } catch (err: any) {
      console.error('Error in getTeacherPhotoById:', err);
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= ADMIN: RESET TEACHER PASSWORD =================
  resetTeacherPassword = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      const result = await AuthService.resetTeacherPassword(teacherId);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= ADMIN: UPDATE TEACHER STATUS =================
  updateTeacherStatus = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const teacherId = toInt(id);

      if (isNaN(teacherId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean'
        });
      }

      const teacher = await AuthService.updateTeacherStatus(teacherId, isActive);
      
      res.json({
        success: true,
        message: `Teacher ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: teacher,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };


  // ================= ADMIN → CREATE STUDENT =================
  createStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const {
        email,
        name,
        classId,
        dateOfBirth,
        gender,
        fatherName,
        motherName,
        parentPhone,
        address,
        city,
        state,
        pincode,
        bloodGroup,
        phone,
        parentEmail,
        nationality,
        religion,
        admissionDate,
        previousSchool,
        previousClass
      } = req.body;

      // ========== VALIDATE ALL REQUIRED FIELDS (NO NULLS ALLOWED) ==========
      const requiredFields = {
        email: 'Email is required',
        name: 'Name is required',
        classId: 'Class ID is required',
        dateOfBirth: 'Date of birth is required',
        gender: 'Gender is required',
        fatherName: 'Father name is required',
        motherName: 'Mother name is required',
        parentPhone: 'Parent phone is required',
        address: 'Address is required',
        city: 'City is required',
        state: 'State is required',
        pincode: 'Pincode is required'
      };

      const missingFields: string[] = [];
      
      for (const [field] of Object.entries(requiredFields)) {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          requiredFields: Object.keys(requiredFields)
        });
      }

      // ========== VALIDATE DATE FORMAT ==========
      if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for dateOfBirth. Use YYYY-MM-DD'
        });
      }

      // ========== VALIDATE GENDER ==========
      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (gender && !validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: `Gender must be one of: ${validGenders.join(', ')}`
        });
      }

      // ========== VALIDATE EMAIL FORMAT ==========
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // ========== VALIDATE PINCODE (6 digits) ==========
      if (pincode && !/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Pincode must be 6 digits'
        });
      }

      // ========== VALIDATE PARENT PHONE (10 digits) ==========
      const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
      if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Parent phone must be a valid 10-digit number'
        });
      }

      // ========== VALIDATE STUDENT PHONE (10 digits) if provided ==========
      if (phone) {
        const cleanStudentPhone = phone.replace(/[^0-9]/g, '');
        if (!/^\d{10}$/.test(cleanStudentPhone)) {
          return res.status(400).json({
            success: false,
            message: 'Student phone must be a valid 10-digit number'
          });
        }
      }

      // ========== VALIDATE PARENT EMAIL if provided ==========
      if (parentEmail && !emailRegex.test(parentEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent email format'
        });
      }

      // ========== VALIDATE ADMISSION DATE if provided ==========
      if (admissionDate && isNaN(new Date(admissionDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format for admissionDate. Use YYYY-MM-DD'
        });
      }

      // ========== CALL SERVICE TO CREATE STUDENT ==========
      const data = await AuthService.createStudent(req.body, req.user!.id);

      res.json({
        success: true,
        message: "Student created successfully. Credentials sent to email.",
        data: {
          id: data.id,
          rollNumber: data.rollNumber,
          name: data.name,
          email: data.email,
          class: data.class,
          defaultPassword: data.defaultPassword
        },
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= ADMIN: TRANSFER STUDENT TO ANOTHER CLASS =================
  transferStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { id } = req.params;
      const { newClassId, reason } = req.body;

      // Validate required fields
      if (!newClassId) {
        return res.status(400).json({
          success: false,
          message: 'newClassId is required'
        });
      }

      const studentId = toInt(id);
      const newClassIdNum = toInt(newClassId);

      if (isNaN(studentId) || isNaN(newClassIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID or class ID'
        });
      }

      const student = await AuthService.getStudentById(studentId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const newClass = await AuthService.getClassById(newClassIdNum);

      if (!newClass) {
        return res.status(404).json({
          success: false,
          message: 'New class not found'
        });
      }

      if (student.classId === newClassIdNum) {
        return res.status(400).json({
          success: false,
          message: 'Student is already in this class'
        });
      }

      const oldClassName = `${student.class.name} ${student.class.section}`;
      const newClassName = `${newClass.name} ${newClass.section}`;

      const transferredStudent = await AuthService.transferStudent(
        studentId,
        newClassIdNum,
        reason || null,
        req.user!.id
      );

      return res.status(200).json({
        success: true,
        message: `Student transferred from ${oldClassName} to ${newClassName}`,
        data: {
          studentId: transferredStudent.id,
          name: transferredStudent.user.name,
          rollNumber: transferredStudent.rollNumber,
          oldClass: oldClassName,
          newClass: newClassName,
          transferredAt: new Date().toISOString(),
          reason: reason || null
        },
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= PUBLIC REGISTER =================
  publicRegister = async (
    req: any,
    res: Response
  ) => {

    try {

      const { email, password, name, role } = req.body;

      const missingFields: string[] = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!name) missingFields.push('name');
      if (!role) missingFields.push('role');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const data = await AuthService.publicRegister(req.body);

      res.json({
        success: true,
        message: "Registered successfully (PENDING approval)",
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= APPROVE / REJECT USER =================
  approveOrRejectUser = async (
    req: any,
    res: Response
  ) => {

    try {

      const { userId, action } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      if (!action || !['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'action must be APPROVE or REJECT'
        });
      }

      const data = await AuthService.approveOrRejectUser(Number(userId), action);

      res.json({
        success: true,
        message: `User ${action.toLowerCase()}d successfully`,
        data
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= GET CURRENT USER =================
  getMe = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found'
        });
      }

      const data = await AuthService.getMe(req.user!.id);

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= GET ALL USERS =================
  getAllUsers = async (
    _req: any,
    res: Response
  ) => {

    try {

      const data = await AuthService.getAllUsers();

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {

      res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });

    }

  };


  // ================= UPDATE USER =================
  updateUser = async (
    req: any,
    res: Response
  ) => {

    try {

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const data = await AuthService.updateUser(Number(id), req.body);

      res.json({
        success: true,
        message: "User updated successfully",
        data
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= DELETE USER =================
  deleteUser = async (
    req: any,
    res: Response
  ) => {

    try {

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      await AuthService.deleteUser(Number(id));

      res.json({
        success: true,
        message: "User deleted successfully"
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= LOGOUT =================
  logout = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      await AuthService.logout(refreshToken);

      res.json({
        success: true,
        message: "Logged out successfully"
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= REFRESH TOKEN =================
  refresh = async (
    req: any,
    res: Response
  ) => {

    try {

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      const data = await AuthService.refresh(refreshToken);

      res.json({
        success: true,
        data
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= FORGOT PASSWORD =================
  forgotPassword = async (
    req: any,
    res: Response
  ) => {

    try {

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const data = await AuthService.forgotPassword(email);

      res.json({
        success: true,
        message: "Password reset token generated",
        data
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= RESET PASSWORD =================
  resetPassword = async (
    req: any,
    res: Response
  ) => {

    try {

      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      await AuthService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: "Password reset successful"
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= CHANGE PASSWORD =================
  changePassword = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    try {

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }

      await AuthService.changePassword(req.user!.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: "Password changed successfully"
      });

    } catch (err: any) {

      res.status(400).json({
        success: false,
        message: err.message
      });

    }

  };


  // ================= STUDENT: GET OWN FULL PROFILE =================
  getOwnProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user || user.role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: 'Only students can access this'
        });
      }

      const student = await AuthService.getStudentWithDetails(user.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.user.name,
          email: student.user.email,
          phone: student.user.phone,
          class: `${student.class.name} ${student.class.section}`,
          classId: student.class.id,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          address: student.address,
          city: student.city,
          state: student.state,
          
          fatherName: student.fatherName,
          motherName: student.motherName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          admissionDate: student.admissionDate,
          profilePhoto: student.profilePhoto ? `/uploads/students/${student.profilePhoto.split('/').pop()}` : null
        }
      });

    } catch (error: any) {
      console.error('Get own profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };


  // ================= STUDENT: UPDATE OWN PROFILE =================
  updateOwnProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user || user.role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: 'Only students can update their own profile'
        });
      }

      const { phone, address, city, state, pincode } = req.body;

      const updatedStudent = await AuthService.updateStudentProfile(user.id, {
        phone,
        address,
        city,
        state,
        pincode
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          phone: updatedStudent.phone,
          address: updatedStudent.address,
          city: updatedStudent.city,
          state: updatedStudent.state,
        
        }
      });

    } catch (error: any) {
      console.error('Update own profile error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };


  // ================= STUDENT: UPLOAD PROFILE PHOTO =================
  uploadOwnProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select an image file (jpeg, jpg, png, gif)'
        });
      }

      if (!user || user.role !== 'STUDENT') {
        if (file) fs.unlinkSync(file.path);
        return res.status(403).json({
          success: false,
          message: 'Only students can upload profile photo'
        });
      }

      const student = await AuthService.getStudentByUserId(user.id);

      if (!student) {
        if (file) fs.unlinkSync(file.path);
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      if (student.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '../../', student.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const photoUrl = `/uploads/students/${file.filename}`;
      const updatedStudent = await AuthService.updateStudentPhoto(student.id, photoUrl);

      return res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          profilePhoto: updatedStudent.profilePhoto,
          fileUrl: `${req.protocol}://${req.get('host')}${photoUrl}`
        }
      });

    } catch (error: any) {
      console.error('Upload photo error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };


  // ================= STUDENT: GET PROFILE PHOTO =================
  getOwnProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user || user.role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: 'Only students can access this'
        });
      }

      const student = await AuthService.getStudentByUserId(user.id);

      if (!student || !student.profilePhoto) {
        return res.status(404).json({
          success: false,
          message: 'Profile photo not found'
        });
      }

      const photoPath = path.join(__dirname, '../../', student.profilePhoto);
      
      if (!fs.existsSync(photoPath)) {
        return res.status(404).json({
          success: false,
          message: 'Photo file not found'
        });
      }

      return res.sendFile(photoPath);

    } catch (error: any) {
      console.error('Get profile photo error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };


  // ================= STUDENT: DELETE PROFILE PHOTO =================
  deleteOwnProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user || user.role !== 'STUDENT') {
        return res.status(403).json({
          success: false,
          message: 'Only students can delete their own profile photo'
        });
      }

      const student = await AuthService.getStudentByUserId(user.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      if (student.profilePhoto) {
        const photoPath = path.join(__dirname, '../../', student.profilePhoto);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      await AuthService.updateStudentPhoto(student.id, null);

      return res.status(200).json({
        success: true,
        message: 'Profile photo deleted successfully'
      });

    } catch (error: any) {
      console.error('Delete profile photo error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };


  // ================= NEW: SUPERADMIN/ADMIN STUDENT MANAGEMENT METHODS =================

  // ================= GET ALL STUDENTS WITH FULL DETAILS =================
  getAllStudentsWithDetails = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      // Check if superadmin or admin
      if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Superadmin only.'
        });
      }

      const students = await AuthService.getAllStudentsWithDetails();
      
      res.json({
        success: true,
        data: students,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= GET ALL ADMINS (SUPERADMIN ONLY) =================
  getAllAdmins = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      if (req.user?.role !== 'SUPERADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Superadmin only.'
        });
      }

      const admins = await AuthService.getAllAdmins();
      
      res.json({
        success: true,
        data: admins,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= GET STUDENT DETAILS BY ID =================
  getStudentDetailsById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const studentId = toInt(id);

      if (isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      // Check permission
      if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const student = await AuthService.getStudentDetailsById(studentId);
      
      res.json({
        success: true,
        data: student,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= GET STUDENT PHOTO BY ID (For Admin/Superadmin) - IMPROVED VERSION =================
  getStudentPhotoById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const studentId = toInt(id);

      if (isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      console.log(`📸 Fetching photo for student ID: ${studentId}`);
      
      const photoPath = await AuthService.getStudentPhotoById(studentId);

      if (!photoPath) {
        console.log(`❌ No photo found for student ID: ${studentId}`);
        return res.status(404).json({
          success: false,
          message: 'Profile photo not found'
        });
      }

      console.log(`✅ Photo found at: ${photoPath}`);
      
      // Check if file exists
      if (!fs.existsSync(photoPath)) {
        console.log(`❌ File does not exist at: ${photoPath}`);
        return res.status(404).json({
          success: false,
          message: 'Photo file not found on server'
        });
      }

      return res.sendFile(photoPath);
    } catch (err: any) {
      console.error('Error in getStudentPhotoById:', err);
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= UPDATE STUDENT STATUS (ACTIVATE/DEACTIVATE) =================
  updateStudentStatus = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const studentId = toInt(id);

      if (isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean'
        });
      }

      const student = await AuthService.updateStudentStatus(studentId, isActive);
      
      res.json({
        success: true,
        message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: student,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= RESET STUDENT PASSWORD =================
  resetStudentPassword = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const studentId = toInt(id);

      if (isNaN(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const result = await AuthService.resetStudentPassword(studentId);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= GET STUDENT STATISTICS =================
  getStudentStatistics = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const stats = await AuthService.getStudentStatistics();
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

  // ================= EXPORT STUDENTS DATA =================
  exportStudentsData = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { format = 'csv' } = req.query;
      const csvData = await AuthService.exportStudentsData(format as string);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=students_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvData);
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };

}

export default new AuthController();