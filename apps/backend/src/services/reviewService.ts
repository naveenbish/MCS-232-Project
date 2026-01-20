import prisma from '../config/database';
import { CreateReviewInput, UpdateReviewInput, AppError } from '../types';

/**
 * Create a review
 */
export const createReview = async (userId: string, data: CreateReviewInput) => {
  // Check if food item exists
  const foodItem = await prisma.foodItem.findUnique({
    where: { id: data.foodItemId },
  });

  if (!foodItem) {
    throw new AppError('Food item not found', 404);
  }

  // Check if user has ordered this item
  const hasOrdered = await prisma.orderDetail.findFirst({
    where: {
      itemId: data.foodItemId,
      order: {
        userId,
        status: {
          in: ['DELIVERED', 'COMPLETED'],
        },
      },
    },
  });

  if (!hasOrdered) {
    throw new AppError('You can only review items you have ordered', 400);
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_foodItemId: {
        userId,
        foodItemId: data.foodItemId,
      },
    },
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this item', 409);
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Create review
  return await prisma.review.create({
    data: {
      userId,
      foodItemId: data.foodItemId,
      rating: data.rating,
      comments: data.comments,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  data: UpdateReviewInput
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized to update this review', 403);
  }

  // Validate rating if provided
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(data.rating && { rating: data.rating }),
      ...(data.comments !== undefined && { comments: data.comments }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized to delete this review', 403);
  }

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};

/**
 * Get reviews for a food item
 */
export const getReviewsByFoodItem = async (
  foodItemId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { foodItemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { foodItemId } }),
  ]);

  // Calculate average rating
  const avgRating =
    total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    total,
    page,
    limit,
    averageRating: Math.round(avgRating * 10) / 10,
  };
};

/**
 * Get user's reviews
 */
export const getUserReviews = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        foodItem: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    reviews,
    total,
    page,
    limit,
  };
};

export default {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByFoodItem,
  getUserReviews,
};
