import { type ReactNode, useState } from "react";
import type { Coords } from "../types";
import { CoordsContext, defaultCoords } from "./coords";

export function CoordsProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords>(defaultCoords);

  return (
    <CoordsContext.Provider value={{ coords, setCoords }}>
      {children}
    </CoordsContext.Provider>
  );
}
