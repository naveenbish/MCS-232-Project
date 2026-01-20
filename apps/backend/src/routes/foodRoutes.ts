import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as foodController from '../controllers/foodController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * Validation rules
 */
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

const foodItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Food item name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('availabilityStatus')
    .optional()
    .isBoolean()
    .withMessage('Availability status must be boolean'),
];

const uuidValidation = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

// Public routes - Categories
router.get('/categories', foodController.getAllCategories);
router.get('/categories/:id', validate(uuidValidation), foodController.getCategoryById);

// Public routes - Food Items
router.get('/items', foodController.getAllFoodItems);
router.get('/items/:id', validate(uuidValidation), foodController.getFoodItemById);

export default router;
