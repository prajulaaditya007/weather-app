import { useContext } from "react";
import { CoordsContext } from "./coords";

export function useCoords() {
  const context = useContext(CoordsContext);

  if (!context) {
    throw new Error("useCoords must be used within a CoordsProvider");
  }

  return context;
}
