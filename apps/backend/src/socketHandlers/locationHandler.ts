import { Socket } from 'socket.io';
import locationService from '../services/locationService';
import logger from '../config/logger';

/**
 * Handle location-related socket events
 */
export const handleLocationEvents = (socket: Socket) => {
  const user = socket.data.user;

  /**
   * Handle real-time location updates
   */
  socket.on('location:update', async (data: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  }) => {
    try {
      logger.debug(`Location update from user ${user.email}: ${data.latitude}, ${data.longitude}`);

      await locationService.updateUserLocation({
        userId: user.id,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        altitudeAccuracy: data.altitudeAccuracy,
        heading: data.heading,
        speed: data.speed,
        timestamp: new Date(),
      });

      // Acknowledge the update
      socket.emit('location:update-ack', {
        success: true,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to update location for user ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to update location',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle location tracking start
   */
  socket.on('location:start-tracking', async () => {
    try {
      await locationService.startLocationTracking(user.id);

      // Join location tracking room
      socket.join(`location:${user.id}`);

      socket.emit('location:tracking-started', {
        success: true,
        message: 'Location tracking started',
        timestamp: new Date(),
      });

      logger.info(`Location tracking started for user ${user.email}`);
    } catch (error) {
      logger.error(`Failed to start location tracking for user ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to start location tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle location tracking stop
   */
  socket.on('location:stop-tracking', async () => {
    try {
      await locationService.stopLocationTracking(user.id);

      // Leave location tracking room
      socket.leave(`location:${user.id}`);

      socket.emit('location:tracking-stopped', {
        success: true,
        message: 'Location tracking stopped',
        timestamp: new Date(),
      });

      logger.info(`Location tracking stopped for user ${user.email}`);
    } catch (error) {
      logger.error(`Failed to stop location tracking for user ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to stop location tracking',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle request for nearby users
   */
  socket.on('location:find-nearby', async (data: {
    latitude: number;
    longitude: number;
    radius?: number;
  }) => {
    try {
      const nearbyUsers = await locationService.findNearbyUsers(
        user.id,
        data.latitude,
        data.longitude,
        data.radius || 5000
      );

      socket.emit('location:nearby-users', {
        users: nearbyUsers,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to find nearby users for ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to find nearby users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle location sharing request
   */
  socket.on('location:share', async (data: {
    targetUserId: string;
    duration?: number; // Duration in minutes
  }) => {
    try {
      const { targetUserId, duration = 30 } = data;

      // Join a shared location room
      const sharedRoomId = `location-share:${user.id}:${targetUserId}`;
      socket.join(sharedRoomId);

      // Notify the target user
      socket.to(`user:${targetUserId}`).emit('location:share-request', {
        fromUserId: user.id,
        fromUserEmail: user.email,
        duration,
        roomId: sharedRoomId,
        timestamp: new Date(),
      });

      // Set a timer to stop sharing after duration
      setTimeout(() => {
        socket.leave(sharedRoomId);
        socket.emit('location:share-expired', {
          targetUserId,
          timestamp: new Date(),
        });
      }, duration * 60 * 1000);

      socket.emit('location:share-initiated', {
        targetUserId,
        duration,
        timestamp: new Date(),
      });

      logger.info(`Location sharing initiated from ${user.email} to ${targetUserId} for ${duration} minutes`);
    } catch (error) {
      logger.error(`Failed to initiate location sharing for ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to share location',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle acceptance of location sharing
   */
  socket.on('location:share-accept', async (data: {
    fromUserId: string;
    roomId: string;
  }) => {
    try {
      const { fromUserId, roomId } = data;

      // Join the shared room
      socket.join(roomId);

      // Notify the original requester
      socket.to(`user:${fromUserId}`).emit('location:share-accepted', {
        byUserId: user.id,
        byUserEmail: user.email,
        timestamp: new Date(),
      });

      socket.emit('location:share-joined', {
        withUserId: fromUserId,
        roomId,
        timestamp: new Date(),
      });

      logger.info(`Location sharing accepted by ${user.email} from ${fromUserId}`);
    } catch (error) {
      logger.error(`Failed to accept location sharing for ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to accept location sharing',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle rejection of location sharing
   */
  socket.on('location:share-reject', async (data: {
    fromUserId: string;
  }) => {
    try {
      const { fromUserId } = data;

      // Notify the original requester
      socket.to(`user:${fromUserId}`).emit('location:share-rejected', {
        byUserId: user.id,
        byUserEmail: user.email,
        timestamp: new Date(),
      });

      logger.info(`Location sharing rejected by ${user.email} from ${fromUserId}`);
    } catch (error) {
      logger.error(`Failed to reject location sharing for ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to reject location sharing',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * Handle geofence entry/exit
   */
  socket.on('location:geofence', async (data: {
    fenceId: string;
    event: 'enter' | 'exit';
    latitude: number;
    longitude: number;
  }) => {
    try {
      const { fenceId, event, latitude, longitude } = data;

      // Broadcast geofence event to admin
      socket.to('admin').emit('location:geofence-event', {
        userId: user.id,
        userEmail: user.email,
        fenceId,
        event,
        latitude,
        longitude,
        timestamp: new Date(),
      });

      // Acknowledge the event
      socket.emit('location:geofence-ack', {
        fenceId,
        event,
        timestamp: new Date(),
      });

      logger.info(`Geofence ${event} for user ${user.email}: fence ${fenceId}`);
    } catch (error) {
      logger.error(`Failed to handle geofence event for ${user.email}:`, error);
      socket.emit('location:error', {
        message: 'Failed to process geofence event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

export default handleLocationEvents;