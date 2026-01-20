import { Request, Response } from 'express';
import locationService from '../services/locationService';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../config/logger';

/**
 * Update user location
 */
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = req.body;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    if (!latitude || !longitude) {
      return errorResponse(res, 'Latitude and longitude are required', 400);
    }

    const location = await locationService.updateUserLocation({
      userId,
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
      timestamp: new Date(),
    });

    return successResponse(res, 'Location updated successfully', location);
  } catch (error) {
    logger.error('Error updating location:', error);
    return errorResponse(res, 'Failed to update location');
  }
};

/**
 * Get user's location history
 */
export const getLocationHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const history = await locationService.getUserLocationHistory(
      userId,
      Number(limit),
      Number(offset)
    );

    return successResponse(res, 'Location history fetched successfully', history);
  } catch (error) {
    logger.error('Error fetching location history:', error);
    return errorResponse(res, 'Failed to fetch location history');
  }
};

/**
 * Find nearby users
 */
export const findNearbyUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    if (!latitude || !longitude) {
      return errorResponse(res, 'Latitude and longitude are required', 400);
    }

    const nearbyUsers = await locationService.findNearbyUsers(
      userId,
      Number(latitude),
      Number(longitude),
      Number(radius)
    );

    return successResponse(res, 'Nearby users fetched successfully', nearbyUsers);
  } catch (error) {
    logger.error('Error finding nearby users:', error);
    return errorResponse(res, 'Failed to find nearby users');
  }
};

/**
 * Start location tracking
 */
export const startTracking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    await locationService.startLocationTracking(userId);

    return successResponse(res, 'Location tracking started successfully');
  } catch (error) {
    logger.error('Error starting location tracking:', error);
    return errorResponse(res, 'Failed to start location tracking');
  }
};

/**
 * Stop location tracking
 */
export const stopTracking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    await locationService.stopLocationTracking(userId);

    return successResponse(res, 'Location tracking stopped successfully');
  } catch (error) {
    logger.error('Error stopping location tracking:', error);
    return errorResponse(res, 'Failed to stop location tracking');
  }
};

/**
 * Get current location of a user
 */
export const getCurrentLocation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    // Check permissions - user can get their own location or admin can get any user's location
    if (requestingUserId !== userId && req.user?.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to access this location', 403);
    }

    const location = await locationService.getUserCurrentLocation(userId);

    if (!location) {
      return errorResponse(res, 'Location not found', 404);
    }

    return successResponse(res, 'Current location fetched successfully', location);
  } catch (error) {
    logger.error('Error fetching current location:', error);
    return errorResponse(res, 'Failed to fetch current location');
  }
};

export default {
  updateLocation,
  getLocationHistory,
  findNearbyUsers,
  startTracking,
  stopTracking,
  getCurrentLocation,
};