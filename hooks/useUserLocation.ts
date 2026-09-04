import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import type { Coordinates } from '../lib/restaurantProduct';

export type LocationPermissionState = 'idle' | 'granted' | 'denied' | 'unavailable';

export function useUserLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('idle');
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(async () => {
    if (isLocating) return null;
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setPermissionState('denied');
        return null;
      }
      setPermissionState('granted');
      const cached = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 1000 });
      const position = cached || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoordinates(next);
      return next;
    } catch {
      setPermissionState('unavailable');
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [isLocating]);

  return { coordinates, permissionState, isLocating, requestLocation };
}
