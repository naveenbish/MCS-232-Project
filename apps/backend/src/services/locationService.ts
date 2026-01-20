import { PrismaClient } from '@prisma/client';
import { getIO } from '../config/socket';
import logger from '../config/logger';

const prisma = new PrismaClient();

export interface LocationUpdate {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface LocationHistory {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  createdAt: Date;
}

export interface NearbyUser {
  userId: string;
  email: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  lastUpdated: Date;
}

/**
 * Update user location and broadcast to relevant channels
 */
export const updateUserLocation = async (locationData: LocationUpdate): Promise<LocationHistory> => {
  try {
    // Store location in database (assuming you have a LocationHistory table)
    // If not, you can store it in memory or Redis for real-time tracking
    const location = {
      userId: locationData.userId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy || null,
      altitude: locationData.altitude || null,
      altitudeAccuracy: locationData.altitudeAccuracy || null,
      heading: locationData.heading || null,
      speed: locationData.speed || null,
      timestamp: locationData.timestamp,
    };

    // Emit location update to relevant rooms
    const io = getIO();

    // Emit to user's own room for tracking
    io.to(`user:${locationData.userId}`).emit('location:self-update', location);

    // Emit to admin room for monitoring
    io.to('admin').emit('location:user-update', {
      ...location,
      userId: locationData.userId,
    });

    // Emit to nearby users (within a certain radius)
    const nearbyUsers = await findNearbyUsers(
      locationData.userId,
      locationData.latitude,
      locationData.longitude,
      5000 // 5km radius
    );

    nearbyUsers.forEach(nearbyUser => {
      io.to(`user:${nearbyUser.userId}`).emit('location:nearby-update', {
        userId: locationData.userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        distance: nearbyUser.distance,
      });
    });

    logger.info(`Location updated for user ${locationData.userId}: ${locationData.latitude}, ${locationData.longitude}`);

    // Return the stored location (mock for now)
    return {
      id: `loc_${Date.now()}`,
      ...location,
      createdAt: new Date(),
    } as LocationHistory;
  } catch (error) {
    logger.error('Failed to update user location:', error);
    throw error;
  }
};

/**
 * Get user's location history
 */
export const getUserLocationHistory = async (
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<LocationHistory[]> => {
  try {
    // In a real implementation, fetch from database
    // For now, return mock data
    logger.info(`Fetching location history for user ${userId}`);

    return [];
  } catch (error) {
    logger.error('Failed to fetch location history:', error);
    throw error;
  }
};

/**
 * Find nearby users within a certain radius
 */
export const findNearbyUsers = async (
  currentUserId: string,
  latitude: number,
  longitude: number,
  radiusInMeters: number = 5000
): Promise<NearbyUser[]> => {
  try {
    // In a real implementation, you would:
    // 1. Query active user locations from database/cache
    // 2. Calculate distances using Haversine formula
    // 3. Filter users within the radius

    const nearbyUsers: NearbyUser[] = [];

    // Mock implementation - in production, query from database
    // Example with raw SQL for PostGIS:
    /*
    const query = `
      SELECT
        u.id as userId,
        u.email,
        u.name,
        l.latitude,
        l.longitude,
        ST_Distance(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(l.longitude, l.latitude)::geography
        ) as distance,
        l.updatedAt as lastUpdated
      FROM users u
      JOIN user_locations l ON u.id = l.userId
      WHERE u.id != $3
        AND l.updatedAt > NOW() - INTERVAL '5 minutes'
        AND ST_DWithin(
          ST_MakePoint($1, $2)::geography,
          ST_MakePoint(l.longitude, l.latitude)::geography,
          $4
        )
      ORDER BY distance ASC
    `;
    */

    logger.info(`Finding nearby users for ${currentUserId} within ${radiusInMeters}m`);

    return nearbyUsers;
  } catch (error) {
    logger.error('Failed to find nearby users:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Start location tracking session for a user
 */
export const startLocationTracking = async (userId: string): Promise<void> => {
  try {
    const io = getIO();

    // Notify that tracking has started
    io.to(`user:${userId}`).emit('location:tracking-started', {
      message: 'Location tracking has been started',
      timestamp: new Date(),
    });

    logger.info(`Location tracking started for user ${userId}`);
  } catch (error) {
    logger.error('Failed to start location tracking:', error);
    throw error;
  }
};

/**
 * Stop location tracking session for a user
 */
export const stopLocationTracking = async (userId: string): Promise<void> => {
  try {
    const io = getIO();

    // Notify that tracking has stopped
    io.to(`user:${userId}`).emit('location:tracking-stopped', {
      message: 'Location tracking has been stopped',
      timestamp: new Date(),
    });

    logger.info(`Location tracking stopped for user ${userId}`);
  } catch (error) {
    logger.error('Failed to stop location tracking:', error);
    throw error;
  }
};

/**
 * Get current location for a specific user
 */
export const getUserCurrentLocation = async (userId: string): Promise<LocationUpdate | null> => {
  try {
    // In production, fetch from cache/database
    logger.info(`Fetching current location for user ${userId}`);

    return null;
  } catch (error) {
    logger.error('Failed to fetch user current location:', error);
    throw error;
  }
};

export default {
  updateUserLocation,
  getUserLocationHistory,
  findNearbyUsers,
  calculateDistance,
  startLocationTracking,
  stopLocationTracking,
  getUserCurrentLocation,
};