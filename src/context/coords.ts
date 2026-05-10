import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Coords } from "../types";

export type LocationInfo = {
  name: string;
  state?: string;
  country: string;
};

export type LocationStatus = "idle" | "loading" | "success" | "error" | "quota-exceeded";

export type CoordsContextValue = {
  coords: Coords;
  setCoords: Dispatch<SetStateAction<Coords>>;
  location?: LocationInfo;
  locationStatus: LocationStatus;
  locationError?: string;
};

export const defaultCoords: Coords = { lat: 28.51464, lng: 77.07023 };

export const CoordsContext = createContext<CoordsContextValue | undefined>(
  undefined,
);
