import { Response } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/reportService';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get sales report (admin only)
 * GET /api/admin/reports/sales
 */
export const getSalesReport = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const params = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await reportService.getSalesReport(params);

    sendSuccess(res, 'Sales report generated successfully', { report });
  }
);

/**
 * Get user report (admin only)
 * GET /api/admin/reports/users
 */
export const getUserReport = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const report = await reportService.getUserReport();

    sendSuccess(res, 'User report generated successfully', { report });
  }
);

/**
 * Get order report (admin only)
 * GET /api/admin/reports/orders
 */
export const getOrderReport = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const report = await reportService.getOrderReport();

    sendSuccess(res, 'Order report generated successfully', { report });
  }
);

/**
 * Get payment report (admin only)
 * GET /api/admin/reports/payments
 */
export const getPaymentReport = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    const report = await reportService.getPaymentReport(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    sendSuccess(res, 'Payment report generated successfully', { report });
  }
);

/**
 * Get dashboard statistics (admin only)
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await reportService.getDashboardStats();

    sendSuccess(res, 'Dashboard statistics retrieved successfully', { stats });
  }
);

export default {
  getSalesReport,
  getUserReport,
  getOrderReport,
  getPaymentReport,
  getDashboardStats,
};
