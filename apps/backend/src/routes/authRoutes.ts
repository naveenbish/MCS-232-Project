import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Validation rules for registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('contact')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for profile update
 */
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('contact')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(registerValidation),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginValidation),
  authController.login
);

router.post(
  '/admin/login',
  authLimiter,
  validate(loginValidation),
  authController.adminLogin
);

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getCurrentUser);

router.put(
  '/profile',
  authenticate,
  validate(profileUpdateValidation),
  authController.updateProfile
);

router.post('/logout', authenticate, authController.logout);

export default router;
