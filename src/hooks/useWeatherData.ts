import {
  useSuspenseQuery,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { getWeatherData } from "../api";
import type { Coords } from "../types";

export type WeatherData = Awaited<ReturnType<typeof getWeatherData>>;

export function useWeatherData(
  coords: Coords,
): UseSuspenseQueryResult<WeatherData, Error> {
  return useSuspenseQuery({
    queryKey: ["weather", coords.lat, coords.lng],
    queryFn: ({ signal }) =>
      getWeatherData({ lat: coords.lat, lon: coords.lng, signal }),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
}
