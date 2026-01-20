import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

interface LocationHistory {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  createdAt: string;
}

interface NearbyUser {
  userId: string;
  email: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  lastUpdated: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const locationApi = createApi({
  reducerPath: 'locationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/location`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Location', 'History', 'NearbyUsers'],
  endpoints: (builder) => ({
    // Update location
    updateLocation: builder.mutation<ApiResponse<LocationHistory>, LocationUpdate>({
      query: (locationData) => ({
        url: '/update',
        method: 'POST',
        body: locationData,
      }),
      invalidatesTags: ['Location'],
    }),

    // Get location history
    getLocationHistory: builder.query<
      ApiResponse<LocationHistory[]>,
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 100, offset = 0 }) => ({
        url: '/history',
        params: { limit, offset },
      }),
      providesTags: ['History'],
    }),

    // Find nearby users
    findNearbyUsers: builder.query<
      ApiResponse<NearbyUser[]>,
      { latitude: number; longitude: number; radius?: number }
    >({
      query: ({ latitude, longitude, radius = 5000 }) => ({
        url: '/nearby',
        params: { latitude, longitude, radius },
      }),
      providesTags: ['NearbyUsers'],
    }),

    // Start tracking
    startTracking: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/tracking/start',
        method: 'POST',
      }),
      invalidatesTags: ['Location'],
    }),

    // Stop tracking
    stopTracking: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/tracking/stop',
        method: 'POST',
      }),
      invalidatesTags: ['Location'],
    }),

    // Get current location of a specific user
    getCurrentLocation: builder.query<ApiResponse<LocationUpdate>, string>({
      query: (userId) => ({
        url: `/current/${userId}`,
      }),
      providesTags: ['Location'],
    }),
  }),
});

export const {
  useUpdateLocationMutation,
  useGetLocationHistoryQuery,
  useFindNearbyUsersQuery,
  useStartTrackingMutation,
  useStopTrackingMutation,
  useGetCurrentLocationQuery,
} = locationApi;

// Utility functions for location calculations
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

export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatSpeed = (metersPerSecond: number | null): string => {
  if (!metersPerSecond) return '0 km/h';
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`;
};

export const getCompassDirection = (heading: number | null): string => {
  if (heading === null) return 'N/A';

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

export const isLocationStale = (timestamp: Date | string, maxAgeMinutes: number = 5): boolean => {
  const locationTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const ageInMinutes = (now.getTime() - locationTime.getTime()) / (1000 * 60);
  return ageInMinutes > maxAgeMinutes;
};

// Geofencing utilities
export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export const isInsideGeofence = (
  location: { latitude: number; longitude: number },
  fence: Geofence
): boolean => {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    fence.latitude,
    fence.longitude
  );
  return distance <= fence.radius;
};

export const checkGeofenceCrossing = (
  previousLocation: { latitude: number; longitude: number } | null,
  currentLocation: { latitude: number; longitude: number },
  fence: Geofence
): 'enter' | 'exit' | 'none' => {
  if (!previousLocation) return 'none';

  const wasInside = isInsideGeofence(previousLocation, fence);
  const isInside = isInsideGeofence(currentLocation, fence);

  if (!wasInside && isInside) return 'enter';
  if (wasInside && !isInside) return 'exit';
  return 'none';
};

export default locationApi;