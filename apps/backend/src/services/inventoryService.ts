import prisma from '../config/database';
import { Prisma } from '@prisma/client';

/**
 * Get all inventory items with pagination and filters
 */
export async function getAllInventory(params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stockStatus?: 'low' | 'optimal' | 'overstocked' | 'out';
}) {
  const { page = 1, limit = 10, search, categoryId, stockStatus } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.InventoryWhereInput = {};

  // Add search filter
  if (search) {
    where.foodItem = {
      name: { contains: search, mode: 'insensitive' },
    };
  }

  // Add category filter
  if (categoryId) {
    where.foodItem = {
      ...where.foodItem,
      categoryId,
    };
  }

  // Add stock status filter
  if (stockStatus) {
    switch (stockStatus) {
      case 'out':
        where.currentStock = 0;
        break;
      case 'low':
        where.currentStock = {
          gt: 0,
          lte: prisma.inventory.fields.minStock,
        };
        break;
      case 'optimal':
        // This needs to be handled differently
        break;
      case 'overstocked':
        where.currentStock = {
          gte: prisma.inventory.fields.maxStock,
        };
        break;
    }
  }

  const [inventory, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      include: {
        foodItem: {
          include: {
            category: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.inventory.count({ where }),
  ]);

  // Calculate stock status for each item
  const inventoryWithStatus = inventory.map(item => {
    let status: string;
    if (item.currentStock === 0) {
      status = 'out';
    } else if (item.currentStock <= item.minStock) {
      status = 'low';
    } else if (item.currentStock >= item.maxStock) {
      status = 'overstocked';
    } else {
      status = 'optimal';
    }

    return {
      ...item,
      stockStatus: status,
      stockPercentage: (item.currentStock / item.maxStock) * 100,
    };
  });

  return {
    inventory: inventoryWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single inventory item by food item ID
 */
export async function getInventoryByFoodItemId(foodItemId: string) {
  const inventory = await prisma.inventory.findUnique({
    where: { foodItemId },
    include: {
      foodItem: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!inventory) {
    // Create inventory record if it doesn't exist
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId },
    });

    if (!foodItem) {
      throw new Error('Food item not found');
    }

    return await createInventory({
      foodItemId,
      currentStock: 0,
      minStock: 10,
      maxStock: 100,
      unit: 'units',
    });
  }

  return inventory;
}

/**
 * Create inventory record for a food item
 */
export async function createInventory(data: {
  foodItemId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier?: string;
  costPrice?: number;
  location?: string;
  notes?: string;
}) {
  // Check if inventory already exists for this food item
  const existing = await prisma.inventory.findUnique({
    where: { foodItemId: data.foodItemId },
  });

  if (existing) {
    throw new Error('Inventory already exists for this food item');
  }

  // Check if food item exists
  const foodItem = await prisma.foodItem.findUnique({
    where: { id: data.foodItemId },
  });

  if (!foodItem) {
    throw new Error('Food item not found');
  }

  const inventory = await prisma.inventory.create({
    data,
    include: {
      foodItem: {
        include: {
          category: true,
        },
      },
    },
  });

  return inventory;
}

/**
 * Update inventory
 */
export async function updateInventory(
  foodItemId: string,
  data: {
    currentStock?: number;
    minStock?: number;
    maxStock?: number;
    unit?: string;
    supplier?: string;
    costPrice?: number;
    location?: string;
    notes?: string;
  }
) {
  const existing = await prisma.inventory.findUnique({
    where: { foodItemId },
  });

  if (!existing) {
    throw new Error('Inventory not found');
  }

  const updated = await prisma.inventory.update({
    where: { foodItemId },
    data,
    include: {
      foodItem: {
        include: {
          category: true,
        },
      },
    },
  });

  // Update food item availability based on stock
  if (data.currentStock !== undefined) {
    await prisma.foodItem.update({
      where: { id: foodItemId },
      data: {
        availabilityStatus: data.currentStock > 0,
      },
    });
  }

  return updated;
}

/**
 * Restock inventory
 */
export async function restockInventory(
  foodItemId: string,
  quantity: number,
  supplier?: string,
  costPrice?: number
) {
  const inventory = await prisma.inventory.findUnique({
    where: { foodItemId },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const newStock = inventory.currentStock + quantity;

  const updated = await prisma.inventory.update({
    where: { foodItemId },
    data: {
      currentStock: newStock,
      lastRestocked: new Date(),
      supplier: supplier || inventory.supplier,
      costPrice: costPrice || inventory.costPrice,
    },
    include: {
      foodItem: {
        include: {
          category: true,
        },
      },
    },
  });

  // Update food item availability
  await prisma.foodItem.update({
    where: { id: foodItemId },
    data: {
      availabilityStatus: true,
    },
  });

  return updated;
}

/**
 * Adjust stock (for corrections, waste, etc.)
 */
export async function adjustStock(
  foodItemId: string,
  adjustment: number,
  reason: string
) {
  const inventory = await prisma.inventory.findUnique({
    where: { foodItemId },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  const newStock = Math.max(0, inventory.currentStock + adjustment);

  const updated = await prisma.inventory.update({
    where: { foodItemId },
    data: {
      currentStock: newStock,
      notes: `${reason} (${adjustment > 0 ? '+' : ''}${adjustment})`,
    },
    include: {
      foodItem: {
        include: {
          category: true,
        },
      },
    },
  });

  // Update food item availability
  await prisma.foodItem.update({
    where: { id: foodItemId },
    data: {
      availabilityStatus: newStock > 0,
    },
  });

  return updated;
}

/**
 * Get low stock items
 */
export async function getLowStockItems() {
  const items = await prisma.$queryRaw`
    SELECT
      i.*,
      f.name as food_name,
      f.price,
      c.name as category_name
    FROM inventory i
    JOIN food_items f ON i.food_item_id = f.id
    JOIN categories c ON f.category_id = c.id
    WHERE i.current_stock <= i.min_stock
    ORDER BY i.current_stock ASC
  `;

  return items;
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  const [total, lowStock, outOfStock, optimal] = await Promise.all([
    prisma.inventory.count(),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM inventory
      WHERE current_stock > 0 AND current_stock <= min_stock
    `,
    prisma.inventory.count({
      where: { currentStock: 0 },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM inventory
      WHERE current_stock > min_stock AND current_stock < max_stock
    `,
  ]);

  const totalValue = await prisma.$queryRaw<[{ total: number }]>`
    SELECT SUM(current_stock * COALESCE(cost_price, 0)) as total
    FROM inventory
  `;

  return {
    totalItems: total,
    lowStock: Number(lowStock[0].count),
    outOfStock,
    optimal: Number(optimal[0].count),
    totalValue: totalValue[0]?.total || 0,
  };
}

/**
 * Delete inventory record
 */
export async function deleteInventory(foodItemId: string) {
  const inventory = await prisma.inventory.findUnique({
    where: { foodItemId },
  });

  if (!inventory) {
    throw new Error('Inventory not found');
  }

  await prisma.inventory.delete({
    where: { foodItemId },
  });

  return { message: 'Inventory deleted successfully' };
}

/**
 * Initialize inventory for all food items
 */
export async function initializeInventory() {
  const foodItems = await prisma.foodItem.findMany({
    where: {
      inventory: null,
    },
  });

  const inventoryRecords = foodItems.map(item => ({
    foodItemId: item.id,
    currentStock: Math.floor(Math.random() * 50) + 10,
    minStock: 10,
    maxStock: 100,
    unit: 'units',
    lastRestocked: new Date(),
  }));

  const created = await prisma.inventory.createMany({
    data: inventoryRecords,
    skipDuplicates: true,
  });

  return {
    message: `Initialized inventory for ${created.count} items`,
    count: created.count,
  };
}