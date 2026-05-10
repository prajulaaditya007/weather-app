import { LocationListSchema } from "./schemas/locationSchema";
import { OneCallSchema } from "./schemas/weatherSchema";
import { reserveApiCall } from "./utils/apiQuota";

const apiKey = import.meta.env.VITE_API_KEY;

export type CitySearchResult = {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
};

export async function getWeatherData({
  lat,
  lon,
  signal,
}: {
  lat: number;
  lon: number;
  signal?: AbortSignal;
}) {
  if (!reserveApiCall()) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`,
    { signal },
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

export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<CitySearchResult[]> {
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("City search is not available right now.");
  }

  const data = (await response.json()) as PhotonResponse;

  return data.features
    .filter((feature) => feature.properties.osm_value === "city")
    .map((feature) => {
      const [lon, lat] = feature.geometry.coordinates;

      return {
        id: `${feature.properties.osm_type}-${feature.properties.osm_id}`,
        name: feature.properties.name,
        state: feature.properties.state,
        country: feature.properties.country,
        lat,
        lon,
      };
    });
}

export async function getLocationData({
  lat,
  lon,
  signal,
}: {
  lat: number;
  lon: number;
  signal?: AbortSignal;
}) {
  if (!reserveApiCall()) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`,
    { signal },
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

type PhotonResponse = {
  features: PhotonFeature[];
};

type PhotonFeature = {
  properties: {
    osm_type: string;
    osm_id: number;
    osm_value: string;
    name: string;
    state?: string;
    country: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};
