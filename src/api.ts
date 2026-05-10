import { LocationListSchema } from "./schemas/locationSchema";
import { OneCallSchema } from "./schemas/weatherSchema";
import { reserveApiCall } from "./utils/apiQuota";

const apiKey = import.meta.env.VITE_API_KEY;

export async function getWeatherData({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  if (!reserveApiCall()) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API Error");
  }

  const data = await response.json();
  const result = OneCallSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Weather data is not available for this location.", {
      cause: result.error,
    });
  }

  return result.data;
}

export async function getLocationData({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}) {
  if (!reserveApiCall()) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Location API Error");
  }

  const data = await response.json();
  const result = LocationListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Location data is not available for this location.", {
      cause: result.error,
    });
  }

  const location = result.data[0];

  if (!location) {
    return undefined;
  }

  return {
    name: location.local_names?.en ?? location.name,
    state: location.state,
    country: location.country,
  };
}
