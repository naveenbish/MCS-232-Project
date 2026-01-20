import { Router } from 'express';
import { body, param } from 'express-validator';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Validation rules
 */
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Invalid item ID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Delivery address must be between 10 and 500 characters'),
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number format'),
];

const updateOrderStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'PREPARED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
    ])
    .withMessage('Invalid order status'),
];

const uuidValidation = [param('id').isUUID().withMessage('Invalid ID format')];

// User routes
router.post(
  '/',
  orderLimiter,
  validate(createOrderValidation),
  orderController.createOrder
);

router.get('/', orderController.getUserOrders);

router.get('/:id', validate(uuidValidation), orderController.getOrderById);

router.post(
  '/:id/cancel',
  validate(uuidValidation),
  orderController.cancelOrder
);

export default router;
