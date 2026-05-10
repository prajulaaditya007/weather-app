import { type ReactNode, useEffect, useState } from "react";
import { getLocationData } from "../api";
import type { Coords } from "../types";
import {
  CoordsContext,
  defaultCoords,
  type LocationInfo,
  type LocationStatus,
} from "./coords";

const LOCATION_CACHE_KEY = "openweather_location_cache";

export function CoordsProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords>(defaultCoords);
  const [location, setLocation] = useState<LocationInfo>();
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string>();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setCoords(defaultCoords);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 10,
        timeout: 10_000,
      },
    );
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const cacheKey = getLocationCacheKey(coords);
    const cachedLocation = getCachedLocation(cacheKey);

    if (cachedLocation) {
      queueMicrotask(() => {
        if (!isCurrent) return;

        setLocation(cachedLocation);
        setLocationStatus("success");
        setLocationError(undefined);
      });
      return;
    }

    queueMicrotask(() => {
      if (!isCurrent) return;

      setLocation(undefined);
      setLocationStatus("loading");
      setLocationError(undefined);
    });

    getLocationData({ lat: coords.lat, lon: coords.lng })
      .then((locationData) => {
        if (!isCurrent) return;

        setLocation(locationData);
        setLocationStatus(locationData ? "success" : "error");
        setLocationError(
          locationData ? undefined : "Location name is not available.",
        );

        if (locationData) {
          cacheLocation(cacheKey, locationData);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        const message =
          error instanceof Error
            ? error.message
            : "Location name is not available.";

        setLocation(undefined);
        setLocationStatus(
          message === "QUOTA_EXCEEDED" ? "quota-exceeded" : "error",
        );
        setLocationError(message);
      });

    return () => {
      isCurrent = false;
    };
  }, [coords]);

  return (
    <CoordsContext.Provider
      value={{ coords, setCoords, location, locationStatus, locationError }}
    >
      {children}
    </CoordsContext.Provider>
  );
}

function getLocationCacheKey(coords: Coords) {
  return `${coords.lat.toFixed(2)}:${coords.lng.toFixed(2)}`;
}

function getCachedLocation(cacheKey: string) {
  try {
    const cache = readLocationCache();
    return cache[cacheKey];
  } catch {
    return undefined;
  }
}

function cacheLocation(cacheKey: string, location: LocationInfo) {
  try {
    const cache = readLocationCache();
    localStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({ ...cache, [cacheKey]: location }),
    );
  } catch {
    // Cache is only a quota saver. If storage fails, the app can still run.
  }
}

function readLocationCache() {
  const stored = localStorage.getItem(LOCATION_CACHE_KEY);

  if (!stored) return {} as Record<string, LocationInfo>;

  return JSON.parse(stored) as Record<string, LocationInfo>;
}
