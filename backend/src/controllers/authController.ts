import { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import AuthService from '../services/authService.js';
import { AuthenticatedRequest } from '../types/index.js';
import { uploadStudentPhoto } from '../config/multerConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export multer middleware for photo upload
export const uploadPhoto = uploadStudentPhoto.single('photo');

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

      const { email, password, name } = req.body;

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

      const { email, password, name, qualification, specialization, phone, address, hireDate } = req.body;

      // Validate required fields
      const missingFields: string[] = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!name) missingFields.push('name');
      if (!qualification) missingFields.push('qualification');
      if (!specialization) missingFields.push('specialization');

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


  // ================= ADMIN → CREATE STUDENT (ALL FIELDS REQUIRED - NO NULLS) =================
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


  // ================= PUBLIC REGISTER (DISABLED FOR STUDENTS) =================
  publicRegister = async (
    req: any,
    res: Response
  ) => {

    try {

      const { email, password, name, role } = req.body;

      // Validate required fields
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

      // Validate required fields
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


  // ================= STUDENT: UPDATE OWN PROFILE (Limited fields) =================
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


  // ================= STUDENT: UPLOAD OWN PROFILE PHOTO =================
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

      // Delete old photo if exists
      if (student.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '../../', student.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Update student with new photo URL
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


  // ================= STUDENT: GET OWN PROFILE PHOTO =================
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


  // ================= STUDENT: DELETE OWN PROFILE PHOTO =================
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

      // Delete physical file
      if (student.profilePhoto) {
        const photoPath = path.join(__dirname, '../../', student.profilePhoto);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      // Update database
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

}

export default new AuthController();