import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: Date;
}

interface NearbyUser {
  userId: string;
  email: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  lastUpdated: Date;
}

interface LocationTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number;
  autoStart?: boolean;
}

interface UseLocationTrackingReturn {
  currentLocation: LocationData | null;
  nearbyUsers: NearbyUser[];
  isTracking: boolean;
  isConnected: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  shareLocation: (targetUserId: string, duration?: number) => void;
  findNearbyUsers: (radius?: number) => void;
  updateLocation: (location: LocationData) => void;
}

export const useLocationTracking = (
  token: string | null,
  options: LocationTrackingOptions = {}
): UseLocationTrackingReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    updateInterval = 5000,
    autoStart = false,
  } = options;

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize socket connection
   */
  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected for location tracking');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      setError(`Connection error: ${error.message}`);
      console.error('Socket connection error:', error);
    });

    // Location events
    socket.on('location:update-ack', (data) => {
      console.log('Location update acknowledged:', data);
    });

    socket.on('location:self-update', (data: LocationData) => {
      setCurrentLocation(data);
    });

    socket.on('location:nearby-update', (data) => {
      console.log('Nearby user update:', data);
    });

    socket.on('location:nearby-users', (data) => {
      setNearbyUsers(data.users);
    });

    socket.on('location:tracking-started', (data) => {
      setIsTracking(true);
      toast.success(data.message || 'Location tracking started');
    });

    socket.on('location:tracking-stopped', (data) => {
      setIsTracking(false);
      toast.info(data.message || 'Location tracking stopped');
    });

    socket.on('location:error', (data) => {
      setError(data.message);
      toast.error(data.message);
    });

    // Location sharing events
    socket.on('location:share-request', (data) => {
      toast.info(`${data.fromUserEmail} wants to share their location with you for ${data.duration} minutes`, {
        action: {
          label: 'Accept',
          onClick: () => {
            socket.emit('location:share-accept', {
              fromUserId: data.fromUserId,
              roomId: data.roomId,
            });
          },
        },
      });
    });

    socket.on('location:share-accepted', (data) => {
      toast.success(`${data.byUserEmail} accepted your location sharing request`);
    });

    socket.on('location:share-rejected', (data) => {
      toast.error(`${data.byUserEmail} rejected your location sharing request`);
    });

    socket.on('location:share-expired', (data) => {
      toast.info('Location sharing has expired');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  /**
   * Get current position from browser
   */
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  /**
   * Update location via socket
   */
  const updateLocation = useCallback((location: LocationData) => {
    if (!socketRef.current?.connected) {
      setError('Socket not connected');
      return;
    }

    socketRef.current.emit('location:update', location);
    setCurrentLocation(location);
  }, []);

  /**
   * Start location tracking
   */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    if (!socketRef.current?.connected) {
      setError('Socket not connected');
      toast.error('Not connected to server');
      return;
    }

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp),
        };

        updateLocation(locationData);
        setError(null);
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    watchIdRef.current = watchId;

    // Send tracking start event
    socketRef.current.emit('location:start-tracking');

    // Set up periodic updates
    updateIntervalRef.current = setInterval(() => {
      getCurrentPosition()
        .then((position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp),
          };
          updateLocation(locationData);
        })
        .catch((err) => {
          console.error('Failed to get position:', err);
        });
    }, updateInterval);

    setIsTracking(true);
  }, [enableHighAccuracy, timeout, maximumAge, updateInterval, getCurrentPosition, updateLocation]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('location:stop-tracking');
    }

    setIsTracking(false);
  }, []);

  /**
   * Share location with another user
   */
  const shareLocation = useCallback((targetUserId: string, duration: number = 30) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('location:share', {
      targetUserId,
      duration,
    });
  }, []);

  /**
   * Find nearby users
   */
  const findNearbyUsers = useCallback((radius: number = 5000) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server');
      return;
    }

    if (!currentLocation) {
      toast.error('Current location not available');
      return;
    }

    socketRef.current.emit('location:find-nearby', {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius,
    });
  }, [currentLocation]);

  /**
   * Auto-start tracking if enabled
   */
  useEffect(() => {
    if (autoStart && isConnected && !isTracking) {
      startTracking();
    }
  }, [autoStart, isConnected, isTracking, startTracking]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  return {
    currentLocation,
    nearbyUsers,
    isTracking,
    isConnected,
    error,
    startTracking,
    stopTracking,
    shareLocation,
    findNearbyUsers,
    updateLocation,
  };
};

export default useLocationTracking;