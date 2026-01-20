'use client';

import React, { useState, useEffect } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Users, Share2, Loader2, AlertCircle } from 'lucide-react';

interface LocationTrackerProps {
  token: string | null;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ token }) => {
  const {
    currentLocation,
    nearbyUsers,
    isTracking,
    isConnected,
    error,
    startTracking,
    stopTracking,
    shareLocation,
    findNearbyUsers,
  } = useLocationTracking(token, {
    enableHighAccuracy: true,
    updateInterval: 5000,
    autoStart: false,
  });

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    // Find nearby users when location is updated
    if (currentLocation && isTracking) {
      findNearbyUsers(5000);
    }
  }, [currentLocation, isTracking, findNearbyUsers]);

  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatSpeed = (speed: number | null | undefined): string => {
    if (!speed) return 'N/A';
    return `${(speed * 3.6).toFixed(1)} km/h`;
  };

  const handleShareLocation = () => {
    if (selectedUserId) {
      shareLocation(selectedUserId, 30);
      setShareDialogOpen(false);
      setSelectedUserId('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'success' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Badge variant={isTracking ? 'default' : 'outline'}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isTracking ? (
            <Button onClick={startTracking} disabled={!isConnected}>
              <Navigation className="mr-2 h-4 w-4" />
              Start Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive">
              Stop Tracking
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Location
          </CardTitle>
          <CardDescription>Your real-time location information</CardDescription>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="font-mono text-sm">
                  {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="font-mono text-sm">
                  ±{currentLocation.accuracy ? Math.round(currentLocation.accuracy) : 'N/A'}m
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Altitude</p>
                <p className="font-mono text-sm">
                  {currentLocation.altitude ? `${Math.round(currentLocation.altitude)}m` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Speed</p>
                <p className="font-mono text-sm">{formatSpeed(currentLocation.speed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heading</p>
                <p className="font-mono text-sm">
                  {currentLocation.heading ? `${Math.round(currentLocation.heading)}°` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-mono text-sm">
                  {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isTracking ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Acquiring location...</p>
                </div>
              ) : (
                <p>Start tracking to see your location</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nearby Users
          </CardTitle>
          <CardDescription>Users within 5km radius</CardDescription>
        </CardHeader>
        <CardContent>
          {nearbyUsers.length > 0 ? (
            <div className="space-y-3">
              {nearbyUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCoordinates(user.latitude, user.longitude)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatDistance(user.distance)}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUserId(user.userId);
                        shareLocation(user.userId, 30);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => findNearbyUsers(5000)}
                disabled={!currentLocation}
              >
                Refresh Nearby Users
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No nearby users found</p>
              {isTracking && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => findNearbyUsers(5000)}
                  disabled={!currentLocation}
                >
                  Search for Users
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Map (Placeholder for actual map integration) */}
      <Card>
        <CardHeader>
          <CardTitle>Location Map</CardTitle>
          <CardDescription>Visual representation of locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">
              Map integration placeholder - Add Google Maps or Mapbox here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTracker;