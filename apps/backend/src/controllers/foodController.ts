import { Response } from 'express';
import { AuthRequest } from '../types';
import * as foodService from '../services/foodService';
import { sendSuccess, sendCreated, sendNoContent, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * Get all categories
 * GET /api/food/categories
 */
export const getAllCategories = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const categories = await foodService.getAllCategories();
    sendSuccess(res, 'Categories retrieved successfully', { categories });
  }
);

/**
 * Get category by ID
 * GET /api/food/categories/:id
 */
export const getCategoryById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const category = await foodService.getCategoryById(id);
    sendSuccess(res, 'Category retrieved successfully', { category });
  }
);

/**
 * Create category (admin only)
 * POST /api/admin/categories
 */
export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const category = await foodService.createCategory({ name, description });
    logger.info(`Category created: ${category.name} by ${req.user?.email}`);
    sendCreated(res, 'Category created successfully', { category });
  }
);

/**
 * Update category (admin only)
 * PUT /api/admin/categories/:id
 */
export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await foodService.updateCategory(id, { name, description });
    logger.info(`Category updated: ${category.name} by ${req.user?.email}`);
    sendSuccess(res, 'Category updated successfully', { category });
  }
);

/**
 * Delete category (admin only)
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await foodService.deleteCategory(id);
    logger.info(`Category deleted: ${id} by ${req.user?.email}`);
    sendSuccess(res, 'Category deleted successfully');
  }
);

/**
 * Get all food items with filters
 * GET /api/food/items
 */
export const getAllFoodItems = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      availabilityStatus,
      isVeg,
      page,
      limit,
    } = req.query;

    const filters = {
      categoryId: categoryId as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      availabilityStatus:
        availabilityStatus !== undefined
          ? availabilityStatus === 'true'
          : undefined,
      isVeg: isVeg !== undefined ? isVeg === 'true' : undefined,
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await foodService.getAllFoodItems(filters, pagination);

    sendPaginatedResponse(
      res,
      'Food items retrieved successfully',
      result.items,
      result.page,
      result.limit,
      result.total
    );
  }
);

/**
 * Get food item by ID
 * GET /api/food/items/:id
 */
export const getFoodItemById = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const item = await foodService.getFoodItemById(id);
    sendSuccess(res, 'Food item retrieved successfully', { item });
  }
);

/**
 * Create food item (admin only)
 * POST /api/admin/food-items
 */
export const createFoodItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, price, categoryId, description, image, availabilityStatus } =
      req.body;

    const item = await foodService.createFoodItem({
      name,
      price: parseFloat(price),
      categoryId,
      description,
      image,
      availabilityStatus,
    });

    logger.info(`Food item created: ${item.name} by ${req.user?.email}`);
    sendCreated(res, 'Food item created successfully', { item });
  }
);

/**
 * Update food item (admin only)
 * PUT /api/admin/food-items/:id
 */
export const updateFoodItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, price, categoryId, description, image, availabilityStatus } =
      req.body;

    const item = await foodService.updateFoodItem(id, {
      name,
      price: price ? parseFloat(price) : undefined,
      categoryId,
      description,
      image,
      availabilityStatus,
    });

    logger.info(`Food item updated: ${item.name} by ${req.user?.email}`);
    sendSuccess(res, 'Food item updated successfully', { item });
  }
);

/**
 * Delete food item (admin only)
 * DELETE /api/admin/food-items/:id
 */
export const deleteFoodItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await foodService.deleteFoodItem(id);
    logger.info(`Food item deleted: ${id} by ${req.user?.email}`);
    sendSuccess(res, 'Food item deleted successfully');
  }
);

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
