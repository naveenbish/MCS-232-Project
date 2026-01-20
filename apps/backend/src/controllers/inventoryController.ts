import { Response } from 'express';
import { AuthRequest } from '../types';
import * as inventoryService from '../services/inventoryService';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get all inventory items (admin only)
 * GET /api/admin/inventory
 */
export const getAllInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { page, limit, search, categoryId, stockStatus } = req.query;

    const params = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      categoryId: categoryId as string,
      stockStatus: stockStatus as 'low' | 'optimal' | 'overstocked' | 'out',
    };

    const result = await inventoryService.getAllInventory(params);

    sendSuccess(res, 'Inventory retrieved successfully', result);
  }
);

/**
 * Get inventory for specific food item (admin only)
 * GET /api/admin/inventory/:foodItemId
 */
export const getInventoryByFoodItemId = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodItemId } = req.params;

    const inventory = await inventoryService.getInventoryByFoodItemId(foodItemId);

    sendSuccess(res, 'Inventory item retrieved successfully', { inventory });
  }
);

/**
 * Create inventory record (admin only)
 * POST /api/admin/inventory
 */
export const createInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const inventoryData = req.body;

    const inventory = await inventoryService.createInventory(inventoryData);

    sendSuccess(res, 'Inventory created successfully', { inventory }, 201);
  }
);

/**
 * Update inventory (admin only)
 * PUT /api/admin/inventory/:foodItemId
 */
export const updateInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodItemId } = req.params;
    const updateData = req.body;

    const inventory = await inventoryService.updateInventory(foodItemId, updateData);

    sendSuccess(res, 'Inventory updated successfully', { inventory });
  }
);

/**
 * Restock inventory (admin only)
 * POST /api/admin/inventory/:foodItemId/restock
 */
export const restockInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodItemId } = req.params;
    const { quantity, supplier, costPrice } = req.body;

    const inventory = await inventoryService.restockInventory(
      foodItemId,
      quantity,
      supplier,
      costPrice
    );

    sendSuccess(res, 'Inventory restocked successfully', { inventory });
  }
);

/**
 * Adjust stock (admin only)
 * POST /api/admin/inventory/:foodItemId/adjust
 */
export const adjustStock = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodItemId } = req.params;
    const { adjustment, reason } = req.body;

    const inventory = await inventoryService.adjustStock(
      foodItemId,
      adjustment,
      reason
    );

    sendSuccess(res, 'Stock adjusted successfully', { inventory });
  }
);

/**
 * Get low stock items (admin only)
 * GET /api/admin/inventory/low-stock
 */
export const getLowStockItems = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const items = await inventoryService.getLowStockItems();

    sendSuccess(res, 'Low stock items retrieved successfully', { items });
  }
);

/**
 * Get inventory statistics (admin only)
 * GET /api/admin/inventory/stats
 */
export const getInventoryStats = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const stats = await inventoryService.getInventoryStats();

    sendSuccess(res, 'Inventory statistics retrieved successfully', { stats });
  }
);

/**
 * Delete inventory record (admin only)
 * DELETE /api/admin/inventory/:foodItemId
 */
export const deleteInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { foodItemId } = req.params;

    const result = await inventoryService.deleteInventory(foodItemId);

    sendSuccess(res, result.message);
  }
);

/**
 * Initialize inventory for all food items (admin only)
 * POST /api/admin/inventory/initialize
 */
export const initializeInventory = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await inventoryService.initializeInventory();

    sendSuccess(res, result.message, { count: result.count });
  }
);

export default {
  getAllInventory,
  getInventoryByFoodItemId,
  createInventory,
  updateInventory,
  restockInventory,
  adjustStock,
  getLowStockItems,
  getInventoryStats,
  deleteInventory,
  initializeInventory,
};