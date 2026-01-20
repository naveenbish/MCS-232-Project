import prisma from '../config/database';
import {
  CreateFoodItemInput,
  UpdateFoodItemInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  FoodItemFilters,
  PaginationParams,
  AppError,
} from '../types';
import { Prisma } from '@prisma/client';
import { config } from '../config/env';

/**
 * Helper function to transform image path to full URL
 */
const transformImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = config.NODE_ENV === 'production'
    ? config.FRONTEND_URL.replace(/:\d+$/, ':5000')  // Replace frontend port with backend port
    : 'http://localhost:5000';
  return `${baseUrl}${imagePath}`;
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { foodItems: true },
      },
    },
  });
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      foodItems: {
        where: { availabilityStatus: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

/**
 * Create category (admin only)
 */
export const createCategory = async (data: CreateCategoryInput) => {
  return await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
};

/**
 * Update category (admin only)
 */
export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryInput
) => {
  return await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
    },
  });
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (categoryId: string) => {
  // Check if category has food items
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { foodItems: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (category._count.foodItems > 0) {
    throw new AppError(
      'Cannot delete category with existing food items',
      400
    );
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
};

/**
 * Get all food items with filters and pagination
 */
export const getAllFoodItems = async (
  filters: FoodItemFilters,
  pagination: PaginationParams
) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.FoodItemWhereInput = {
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.availabilityStatus !== undefined && {
      availabilityStatus: filters.availabilityStatus,
    }),
    ...(filters.isVeg !== undefined && { isVeg: filters.isVeg }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
    ...(filters.minPrice && { price: { gte: filters.minPrice } }),
    ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
  };

  // Get items and total count
  const [items, total] = await Promise.all([
    prisma.foodItem.findMany({
      where,
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.foodItem.count({ where }),
  ]);

  // Calculate average rating for each item and transform image URLs
  const itemsWithRating = items.map((item) => {
    const avgRating =
      item.reviews.length > 0
        ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
        : 0;

    return {
      ...item,
      image: transformImageUrl(item.image),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: item.reviews.length,
      reviews: undefined, // Remove reviews from response
    };
  });

  return {
    items: itemsWithRating,
    total,
    page,
    limit,
  };
};

/**
 * Get food item by ID
 */
export const getFoodItemById = async (itemId: string) => {
  const item = await prisma.foodItem.findUnique({
    where: { id: itemId },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!item) {
    throw new AppError('Food item not found', 404);
  }

  // Calculate average rating
  const avgRating =
    item.reviews.length > 0
      ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
      : 0;

  return {
    ...item,
    image: transformImageUrl(item.image),
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: item.reviews.length,
  };
};

/**
 * Create food item (admin only)
 */
export const createFoodItem = async (data: CreateFoodItemInput) => {
  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return await prisma.foodItem.create({
    data: {
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      description: data.description,
      image: data.image,
      availabilityStatus: data.availabilityStatus ?? true,
    },
    include: {
      category: true,
    },
  });
};

/**
 * Update food item (admin only)
 */
export const updateFoodItem = async (
  itemId: string,
  data: UpdateFoodItemInput
) => {
  // Verify category exists if being updated
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  return await prisma.foodItem.update({
    where: { id: itemId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.price && { price: data.price }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.availabilityStatus !== undefined && {
        availabilityStatus: data.availabilityStatus,
      }),
    },
    include: {
      category: true,
    },
  });
};

/**
 * Delete food item (admin only)
 */
export const deleteFoodItem = async (itemId: string) => {
  return await prisma.foodItem.delete({
    where: { id: itemId },
  });
};

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
