import { Response } from 'express';
import { AuthRequest, CreateOrderInput } from '../types';
import * as orderService from '../services/orderService';
import { sendSuccess, sendCreated, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { OrderStatus } from '@prisma/client';
import logger from '../config/logger';

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const orderData: CreateOrderInput = req.body;
    const order = await orderService.createOrder(req.user.id, orderData);

    logger.info(`Order created: ${order.id} by user ${req.user.email}`);
    sendCreated(res, 'Order created successfully', { order });
  }
);

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.role === 'user' ? req.user.id : undefined;

    const order = await orderService.getOrderById(id, userId);
    sendSuccess(res, 'Order retrieved successfully', { order });
  }
);

/**
 * Get user's orders
 * GET /api/orders
 */
export const getUserOrders = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await orderService.getUserOrders(req.user.id, page, limit);

    sendPaginatedResponse(
      res,
      'Orders retrieved successfully',
      result.orders,
      result.page,
      result.limit,
      result.total
    );
  }
);

/**
 * Get all orders (admin only)
 * GET /api/admin/orders
 */
export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const status = req.query.status as OrderStatus | undefined;

    const result = await orderService.getAllOrders(page, limit, status);

    sendPaginatedResponse(
      res,
      'Orders retrieved successfully',
      result.orders,
      result.page,
      result.limit,
      result.total
    );
  }
);

/**
 * Update order status (admin only)
 * PUT /api/admin/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status as OrderStatus);

    logger.info(`Order ${id} status updated to ${status} by ${req.user?.email}`);
    sendSuccess(res, 'Order status updated successfully', { order });
  }
);

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user?.role === 'user' ? req.user.id : undefined;

    const order = await orderService.cancelOrder(id, userId);

    logger.info(`Order ${id} cancelled by ${req.user?.email}`);
    sendSuccess(res, 'Order cancelled successfully', { order });
  }
);

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
