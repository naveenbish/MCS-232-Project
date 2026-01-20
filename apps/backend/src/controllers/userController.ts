import { Response } from 'express';
import { AuthRequest } from '../types';
import * as userService from '../services/userService';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { page, limit, search, role, status } = req.query;

    const params = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      role: role as string,
      status: status as string,
    };

    const result = await userService.getAllUsers(params);

    sendSuccess(res, 'Users retrieved successfully', result);
  }
);

/**
 * Get single user by ID (admin only)
 * GET /api/admin/users/:id
 */
export const getUserById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    sendSuccess(res, 'User retrieved successfully', { user });
  }
);

/**
 * Create new user (admin only)
 * POST /api/admin/users
 */
export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userData = req.body;

    const user = await userService.createUser(userData);

    sendSuccess(res, 'User created successfully', { user }, 201);
  }
);

/**
 * Update user (admin only)
 * PUT /api/admin/users/:id
 */
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await userService.updateUser(id, updateData);

    sendSuccess(res, 'User updated successfully', { user });
  }
);

/**
 * Delete user (admin only)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await userService.deleteUser(id);

    sendSuccess(res, result.message);
  }
);

/**
 * Reset user password (admin only)
 * POST /api/admin/users/:id/reset-password
 */
export const resetUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const result = await userService.resetUserPassword(id, newPassword);

    sendSuccess(res, result.message);
  }
);

/**
 * Get user statistics (admin only)
 * GET /api/admin/users/stats
 */
export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await userService.getUserStats();

    sendSuccess(res, 'User statistics retrieved successfully', { stats });
  }
);

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
};