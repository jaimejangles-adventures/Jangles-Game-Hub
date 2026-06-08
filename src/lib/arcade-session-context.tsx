import { createContext, useContext } from "react";

interface ArcadeSessionContextValue {
  /** Call this when the player wants to play again after a game-over.
   *  Resets the ArcadeGate so a new Jangles Buck is required. */
  endSession: () => void;
}

export const ArcadeSessionContext = createContext<ArcadeSessionContextValue>({
  endSession: () => {},
});

export function useArcadeSession() {
  return useContext(ArcadeSessionContext);
}
