import { Router } from 'express';
import { body, param } from 'express-validator';
import * as reviewController from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * Validation rules
 */
const createReviewValidation = [
  body('foodItemId')
    .notEmpty()
    .withMessage('Food item ID is required')
    .isUUID()
    .withMessage('Invalid food item ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments must not exceed 1000 characters'),
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments must not exceed 1000 characters'),
];

const uuidValidation = [param('id').isUUID().withMessage('Invalid ID format')];

const itemIdValidation = [
  param('itemId').isUUID().withMessage('Invalid food item ID'),
];

// Public route - get reviews for a food item
router.get(
  '/food/:itemId',
  validate(itemIdValidation),
  reviewController.getReviewsByFoodItem
);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  reviewLimiter,
  validate(createReviewValidation),
  reviewController.createReview
);

router.put(
  '/:id',
  authenticate,
  validate([...uuidValidation, ...updateReviewValidation]),
  reviewController.updateReview
);

router.delete(
  '/:id',
  authenticate,
  validate(uuidValidation),
  reviewController.deleteReview
);

router.get('/my-reviews', authenticate, reviewController.getUserReviews);

export default router;
