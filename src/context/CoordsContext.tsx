import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useState } from "react";
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
  const queryClient = useQueryClient();
  const [coords, setCoordsState] = useState<Coords>(defaultCoords);
  const locationCacheKey = getLocationCacheKey(coords);

  const setCoords = useCallback(
    (nextCoords: Coords, options?: { location?: LocationInfo }) => {
      if (options?.location) {
        const cacheKey = getLocationCacheKey(nextCoords);

        cacheLocation(cacheKey, options.location);
        queryClient.setQueryData(
          getLocationQueryKey(cacheKey),
          options.location,
        );
      }

      setCoordsState(nextCoords);
    },
    [queryClient],
  );

  const locationQuery = useQuery({
    queryKey: getLocationQueryKey(locationCacheKey),
    queryFn: async ({ signal }) => {
      const locationData = await getLocationData({
        lat: coords.lat,
        lon: coords.lng,
        signal,
      });

      if (!locationData) {
        throw new Error("Location name is not available.");
      }

      cacheLocation(locationCacheKey, locationData);

      return locationData;
    },
    initialData: () => getCachedLocation(locationCacheKey),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

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
  }, [setCoords]);

  const locationError =
    locationQuery.error instanceof Error
      ? locationQuery.error.message
      : undefined;
  const locationStatus = getLocationStatus(locationQuery.status, locationError);

  return (
    <CoordsContext.Provider
      value={{
        coords,
        setCoords,
        location: locationQuery.data,
        locationStatus,
        locationError,
      }}
    >
      {children}
    </CoordsContext.Provider>
  );
}

function getLocationQueryKey(cacheKey: string) {
  return ["location", cacheKey] as const;
}

function getLocationStatus(
  status: "pending" | "error" | "success",
  error?: string,
): LocationStatus {
  if (status === "pending") return "loading";
  if (status === "success") return "success";

  return error === "QUOTA_EXCEEDED" ? "quota-exceeded" : "error";
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
