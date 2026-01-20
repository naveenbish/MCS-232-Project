import { Router } from 'express';
import { body, param } from 'express-validator';
import * as foodController from '../controllers/foodController';
import * as orderController from '../controllers/orderController';
import * as reportController from '../controllers/reportController';
import * as userController from '../controllers/userController';
import * as inventoryController from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

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
    .trim(),
  body('availabilityStatus')
    .optional()
    .isBoolean()
    .withMessage('Availability status must be boolean'),
];

const foodItemUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('image')
    .optional()
    .trim(),
  body('availabilityStatus')
    .optional()
    .isBoolean()
    .withMessage('Availability status must be boolean'),
];

const uuidValidation = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

// Category routes
router.post('/categories', validate(categoryValidation), foodController.createCategory);
router.put('/categories/:id', validate([...uuidValidation, ...categoryValidation]), foodController.updateCategory);
router.delete('/categories/:id', validate(uuidValidation), foodController.deleteCategory);

// Food item routes
router.post('/food-items', validate(foodItemValidation), foodController.createFoodItem);
router.put('/food-items/:id', validate([...uuidValidation, ...foodItemUpdateValidation]), foodController.updateFoodItem);
router.delete('/food-items/:id', validate(uuidValidation), foodController.deleteFoodItem);

// Order management routes
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

router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id/status', validate([...uuidValidation, ...updateOrderStatusValidation]), orderController.updateOrderStatus);

// Report routes
router.get('/reports/sales', reportController.getSalesReport);
router.get('/reports/users', reportController.getUserReport);
router.get('/reports/orders', reportController.getOrderReport);
router.get('/reports/payments', reportController.getPaymentReport);
router.get('/dashboard/stats', reportController.getDashboardStats);

// User management routes
const userValidation = [
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
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('contact')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

const userUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('contact')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

router.get('/users/stats', userController.getUserStats);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', validate(uuidValidation), userController.getUserById);
router.post('/users', validate(userValidation), userController.createUser);
router.put('/users/:id', validate([...uuidValidation, ...userUpdateValidation]), userController.updateUser);
router.delete('/users/:id', validate(uuidValidation), userController.deleteUser);
router.post('/users/:id/reset-password',
  validate([
    ...uuidValidation,
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ]),
  userController.resetUserPassword
);

// Inventory management routes
const inventoryValidation = [
  body('foodItemId')
    .notEmpty()
    .withMessage('Food item ID is required')
    .isUUID()
    .withMessage('Invalid food item ID'),
  body('currentStock')
    .notEmpty()
    .withMessage('Current stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
  body('minStock')
    .notEmpty()
    .withMessage('Minimum stock is required')
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a positive integer'),
  body('maxStock')
    .notEmpty()
    .withMessage('Maximum stock is required')
    .isInt({ min: 1 })
    .withMessage('Maximum stock must be at least 1'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .trim(),
  body('supplier')
    .optional()
    .trim(),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('location')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

const inventoryUpdateValidation = [
  body('currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a positive integer'),
  body('maxStock')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum stock must be at least 1'),
  body('unit')
    .optional()
    .trim(),
  body('supplier')
    .optional()
    .trim(),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('location')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

router.get('/inventory/stats', inventoryController.getInventoryStats);
router.get('/inventory/low-stock', inventoryController.getLowStockItems);
router.post('/inventory/initialize', inventoryController.initializeInventory);
router.get('/inventory', inventoryController.getAllInventory);
router.get('/inventory/:foodItemId', validate(uuidValidation), inventoryController.getInventoryByFoodItemId);
router.post('/inventory', validate(inventoryValidation), inventoryController.createInventory);
router.put('/inventory/:foodItemId', validate([...uuidValidation, ...inventoryUpdateValidation]), inventoryController.updateInventory);
router.delete('/inventory/:foodItemId', validate(uuidValidation), inventoryController.deleteInventory);
router.post('/inventory/:foodItemId/restock',
  validate([
    ...uuidValidation,
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('supplier')
      .optional()
      .trim(),
    body('costPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cost price must be a positive number'),
  ]),
  inventoryController.restockInventory
);
router.post('/inventory/:foodItemId/adjust',
  validate([
    ...uuidValidation,
    body('adjustment')
      .notEmpty()
      .withMessage('Adjustment is required')
      .isInt()
      .withMessage('Adjustment must be an integer'),
    body('reason')
      .notEmpty()
      .withMessage('Reason is required')
      .trim(),
  ]),
  inventoryController.adjustStock
);

export default router;
