import { Response } from 'express';
import { AuthRequest, CreateReviewInput, UpdateReviewInput } from '../types';
import * as reviewService from '../services/reviewService';
import { sendSuccess, sendCreated, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * Create a review
 * POST /api/reviews
 */
export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const data: CreateReviewInput = req.body;
    const review = await reviewService.createReview(req.user.id, data);

    logger.info(`Review created by user ${req.user.email} for food item ${data.foodItemId}`);

    sendCreated(res, 'Review created successfully', { review });
  }
);

/**
 * Update a review
 * PUT /api/reviews/:id
 */
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const data: UpdateReviewInput = req.body;

    const review = await reviewService.updateReview(id, req.user.id, data);

    logger.info(`Review ${id} updated by user ${req.user.email}`);

    sendSuccess(res, 'Review updated successfully', { review });
  }
);

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    await reviewService.deleteReview(id, req.user.id);

    logger.info(`Review ${id} deleted by user ${req.user.email}`);

    sendSuccess(res, 'Review deleted successfully');
  }
);

/**
 * Get reviews for a food item
 * GET /api/reviews/food/:itemId
 */
export const getReviewsByFoodItem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { itemId } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await reviewService.getReviewsByFoodItem(itemId, page, limit);

    sendPaginatedResponse(
      res,
      'Reviews retrieved successfully',
      result.reviews,
      result.page,
      result.limit,
      result.total
    );
  }
);

/**
 * Get user's reviews
 * GET /api/reviews/my-reviews
 */
export const getUserReviews = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await reviewService.getUserReviews(req.user.id, page, limit);

    sendPaginatedResponse(
      res,
      'Your reviews retrieved successfully',
      result.reviews,
      result.page,
      result.limit,
      result.total
    );
  }
);

export default {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByFoodItem,
  getUserReviews,
};
