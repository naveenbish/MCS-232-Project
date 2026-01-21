import crypto from 'crypto';
import prisma from '../config/database';
import { getRazorpayInstance } from '../config/razorpay';
import { config } from '../config/env';
import { CreatePaymentOrderInput, VerifyPaymentInput, AppError } from '../types';
import logger from '../config/logger';
import { emitPaymentUpdate, emitOrderUpdate, emitNewOrderNotification } from '../config/socket';

/**
 * Create Razorpay order
 */
export const createPaymentOrder = async (data: CreatePaymentOrderInput) => {
  // Verify order exists and belongs to the user
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.payment?.paymentStatus === 'COMPLETED') {
    throw new AppError('Payment already completed for this order', 400);
  }

  // Check if Razorpay is configured
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new AppError('Payment gateway not configured. Please contact support.', 503);
  }

  try {
    // Create Razorpay order
    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(data.amount * 100), // Amount in paise
      currency: 'INR',
      receipt: data.orderId.replace(/-/g, '').slice(0, 40), // Max 40 chars
      notes: {
        orderId: data.orderId,
      },
    });

    // Update payment record with Razorpay order ID
    const payment = await prisma.payment.update({
      where: { orderId: data.orderId },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: 'PENDING',
        amount: data.amount,
      },
    });

    logger.info(`Razorpay order created: ${razorpayOrder.id} for order ${data.orderId}`);

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: data.amount,
      currency: 'INR',
      keyId: config.RAZORPAY_KEY_ID,
    };
  } catch (error: any) {
    logger.error('Razorpay order creation failed:', {
      error: error?.message || error,
      description: error?.error?.description,
      orderId: data.orderId,
    });

    // Handle Razorpay specific errors
    if (error?.error?.description) {
      throw new AppError(`Payment error: ${error.error.description}`, 400);
    }

    throw new AppError('Failed to create payment order. Please try again.', 500);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (data: VerifyPaymentInput) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = data;

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    logger.error(`Payment verification failed for order ${orderId}: Invalid signature`);
    throw new AppError('Payment verification failed', 400);
  }

  // Update payment and order status
  const result = await prisma.$transaction(async (tx) => {
    // Update payment
    const payment = await tx.payment.update({
      where: { orderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'COMPLETED',
        paymentMethod: 'razorpay',
        transactionDate: new Date(),
      },
    });

    // Update order status to CONFIRMED
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    return { payment, order };
  });

  logger.info(`Payment verified successfully for order ${orderId}`);

  // Emit payment success to user
  emitPaymentUpdate(result.order.userId, {
    orderId: result.order.id,
    paymentStatus: 'COMPLETED',
    message: 'Payment successful'
  });

  // Emit order confirmation
  emitOrderUpdate(result.order.id, {
    status: 'CONFIRMED',
    message: 'Order confirmed, preparing your food',
    timestamp: new Date()
  });

  // Get full order details and notify admins (only after successful payment)
  const fullOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true, contact: true },
      },
      orderDetails: {
        include: {
          foodItem: { include: { category: true } },
        },
      },
      payment: true,
    },
  });

  if (fullOrder) {
    emitNewOrderNotification(fullOrder);
  }

  return result;
};

/**
 * Handle Razorpay webhook
 */
export const handleWebhook = async (body: any, signature: string) => {
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  if (expectedSignature !== signature) {
    logger.error('Webhook signature verification failed');
    throw new AppError('Invalid webhook signature', 400);
  }

  const event = body.event;
  const payload = body.payload.payment.entity;

  logger.info(`Webhook received: ${event}`);

  switch (event) {
    case 'payment.captured':
      // Payment successful
      await handlePaymentCaptured(payload);
      break;

    case 'payment.failed':
      // Payment failed
      await handlePaymentFailed(payload);
      break;

    default:
      logger.info(`Unhandled webhook event: ${event}`);
  }

  return { success: true };
};

/**
 * Handle payment captured event
 */
const handlePaymentCaptured = async (payload: any) => {
  const razorpayOrderId = payload.order_id;
  const razorpayPaymentId = payload.id;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
  });

  if (!payment) {
    logger.error(`Payment not found for Razorpay order: ${razorpayOrderId}`);
    return;
  }

  if (payment.paymentStatus === 'COMPLETED') {
    logger.info(`Payment already completed for order: ${payment.orderId}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId,
        paymentStatus: 'COMPLETED',
        paymentMethod: payload.method,
        transactionDate: new Date(payload.created_at * 1000),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    });
  });

  logger.info(`Payment captured for order: ${payment.orderId}`);

  // Emit payment update for webhook-captured payment
  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    select: { userId: true }
  });

  if (order) {
    emitPaymentUpdate(order.userId, {
      orderId: payment.orderId,
      paymentStatus: 'COMPLETED',
      message: 'Payment captured successfully'
    });

    emitOrderUpdate(payment.orderId, {
      status: 'CONFIRMED',
      message: 'Payment verified, order confirmed',
      timestamp: new Date()
    });
  }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (payload: any) => {
  const razorpayOrderId = payload.order_id;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
  });

  if (!payment) {
    logger.error(`Payment not found for Razorpay order: ${razorpayOrderId}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentStatus: 'FAILED',
    },
  });

  logger.info(`Payment failed for order: ${payment.orderId}`);

  // Emit payment failure notification
  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    select: { userId: true }
  });

  if (order) {
    emitPaymentUpdate(order.userId, {
      orderId: payment.orderId,
      paymentStatus: 'FAILED',
      message: 'Payment failed. Please try again.'
    });
  }
};

/**
 * Get payment by order ID
 */
export const getPaymentByOrderId = async (orderId: string, userId?: string) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Verify user has access
  if (userId && payment.order.userId !== userId) {
    throw new AppError('Unauthorized to access this payment', 403);
  }

  return payment;
};

export default {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByOrderId,
};
