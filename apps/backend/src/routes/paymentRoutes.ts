import { Router } from 'express';
import { body, param } from 'express-validator';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Validation rules
 */
const createPaymentOrderValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid order ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
];

const verifyPaymentValidation = [
  body('razorpayOrderId')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpaySignature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isUUID()
    .withMessage('Invalid order ID'),
];

const orderIdValidation = [
  param('orderId').isUUID().withMessage('Invalid order ID'),
];

// Webhook endpoint (no authentication)
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.post(
  '/create',
  authenticate,
  paymentLimiter,
  validate(createPaymentOrderValidation),
  paymentController.createPaymentOrder
);

router.post(
  '/verify',
  authenticate,
  validate(verifyPaymentValidation),
  paymentController.verifyPayment
);

router.get(
  '/:orderId',
  authenticate,
  validate(orderIdValidation),
  paymentController.getPaymentByOrderId
);

export default router;
