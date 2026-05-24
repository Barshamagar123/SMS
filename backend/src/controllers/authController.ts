import { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import AuthService from '../services/authService.js';
import { AuthenticatedRequest } from '../types/index.js';

class AuthController {

  // ================= LOGIN =================
  login = async (req: any, res: Response) => {

    try {

      const data = await AuthService.login(
        req.body.email,
        req.body.password
      );

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

      const data = await AuthService.createAdmin(
        req.body,
        req.user!.id
      );

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

      const data = await AuthService.createTeacher(
        req.body,
        req.user!.id
      );

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


  // ================= PUBLIC REGISTER =================
  publicRegister = async (
    req: any,
    res: Response
  ) => {

    try {

      const data = await AuthService.publicRegister(
        req.body
      );

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

      const data =
        await AuthService.approveOrRejectUser(
          Number(userId),
          action
        );

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

      const data = await AuthService.getMe(
        req.user!.id
      );

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

      const data =
        await AuthService.getAllUsers();

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

      const data =
        await AuthService.updateUser(
          Number(req.params.id),
          req.body
        );

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

      await AuthService.deleteUser(
        Number(req.params.id)
      );

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

      await AuthService.logout(
        refreshToken
      );

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

      const data =
        await AuthService.refresh(
          refreshToken
        );

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

      const data =
        await AuthService.forgotPassword(
          req.body.email
        );

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

      const { token, newPassword } =
        req.body;

      await AuthService.resetPassword(
        token,
        newPassword
      );

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

      const {
        currentPassword,
        newPassword
      } = req.body;

      await AuthService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );

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

}

export default new AuthController();