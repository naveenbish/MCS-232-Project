import { Response, Request } from 'express';
import { AuthRequest, CreatePaymentOrderInput, VerifyPaymentInput } from '../types';
import * as paymentService from '../services/paymentService';
import { sendSuccess, sendCreated } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * Create payment order
 * POST /api/payments/create
 */
export const createPaymentOrder = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { orderId, amount }: CreatePaymentOrderInput = req.body;

    const paymentOrder = await paymentService.createPaymentOrder({
      orderId,
      amount,
    });

    logger.info(`Payment order created for order ${orderId} by user ${req.user.email}`);

    sendCreated(res, 'Payment order created successfully', paymentOrder);
  }
);

/**
 * Verify payment
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const data: VerifyPaymentInput = req.body;

    const result = await paymentService.verifyPayment(data);

    logger.info(`Payment verified for order ${data.orderId} by user ${req.user.email}`);

    sendSuccess(res, 'Payment verified successfully', result);
  }
);

/**
 * Handle Razorpay webhook
 * POST /api/payments/webhook
 */
export const handleWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      res.status(400).json({ success: false, message: 'Missing signature' });
      return;
    }

    await paymentService.handleWebhook(req.body, signature);

    res.status(200).json({ success: true });
  }
);

/**
 * Get payment details by order ID
 * GET /api/payments/:orderId
 */
export const getPaymentByOrderId = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const userId = req.user?.role === 'user' ? req.user.id : undefined;

    const payment = await paymentService.getPaymentByOrderId(orderId, userId);

    sendSuccess(res, 'Payment details retrieved successfully', payment);
  }
);

export default {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByOrderId,
};
