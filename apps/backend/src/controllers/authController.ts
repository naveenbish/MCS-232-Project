import { Response } from 'express';
import { AuthRequest, RegisterUserInput, LoginInput, AdminLoginInput } from '../types';
import * as authService from '../services/authService';
import { sendSuccess, sendCreated } from '../utils/response';
import { validatePasswordStrength } from '../utils/password';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const data: RegisterUserInput = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Weak password',
        errors: passwordValidation.errors,
      });
      return;
    }

    // Register user
    const result = await authService.registerUser(data);

    logger.info(`New user registered: ${result.user.email}`);

    // Send response with token
    sendCreated(res, 'User registered successfully', {
      user: result.user,
      token: result.token,
    });
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const data: LoginInput = req.body;

    // Login user
    const result = await authService.loginUser(data);

    logger.info(`User logged in: ${result.user.email}`);

    // Send response with token
    sendSuccess(res, 'Login successful', {
      user: result.user,
      token: result.token,
    });
  }
);

/**
 * Login admin
 * POST /api/auth/admin/login
 */
export const adminLogin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const data: AdminLoginInput = req.body;

    // Login admin
    const result = await authService.loginAdmin(data);

    logger.info(`Admin logged in: ${result.admin.email}`);

    // Send response with token
    sendSuccess(res, 'Admin login successful', {
      admin: result.admin,
      token: result.token,
    });
  }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Get user details
    const user = await authService.getUserById(req.user.id);

    sendSuccess(res, 'User retrieved successfully', { user });
  }
);

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { name, contact, address } = req.body;

    // Update user profile
    const user = await authService.updateUserProfile(req.user.id, {
      name,
      contact,
      address,
    });

    logger.info(`User profile updated: ${user.email}`);

    sendSuccess(res, 'Profile updated successfully', { user });
  }
);

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Since we're using JWT, we just need to clear the client-side token
    // The client should remove the token from storage

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    sendSuccess(res, 'Logout successful');
  }
);

export default {
  register,
  login,
  adminLogin,
  getCurrentUser,
  updateProfile,
  logout,
};
