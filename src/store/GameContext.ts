import { createContext, type Dispatch } from "react";
import type { GameAction, GameState } from "./gameReducer";
import type { MissionResult } from "../types/mission";

export interface GameContextValue {
  state: GameState;
  result: MissionResult;
  dispatch: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);
