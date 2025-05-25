import { createContext, useContext } from "react";
import { Vector3 } from "three";

interface PlayerContextType {
  playerPosition: Vector3;
  setPlayerPosition: (position: Vector3) => void;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
